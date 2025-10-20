import json
from .base_check import BaseCheck
from typing import List, Dict

class SESOverlyPermissiveCheck(BaseCheck):
    """
    [항목 26.1] SES 접근 권한 과다로 인한 대량 피싱/스팸 발송 위험
    - 점검 기준: IAM 정책에 ses:SendEmail, ses:PutAccountDetails 등 고위험 SES 액션이
                 Resource:"*"로 광범위하게 허용되어 있으면 취약
    """

    def _find_vulnerable_statements(self, policy_document: Dict) -> List[Dict]:
        """정책 문서에서 취약한 SES 관련 Allow 문장을 찾습니다."""
        vulnerable_statements = []
        
        DANGEROUS_SES_ACTIONS = {
            'ses:*', 'ses:SendEmail', 'ses:SendRawEmail', 
            'ses:PutAccountDetails', 'ses:PutAccountSendingAttributes', 
            'ses:CreateEmailIdentity', 'ses:VerifyDomainIdentity',
            'sesv2:PutAccountDetails', 'sesv2:PutAccountSendingAttributes',
            'sesv2:CreateEmailIdentity', 'sesv2:VerifyDomainIdentity'
        }

        if not policy_document or 'Statement' not in policy_document:
            return []
            
        for stmt in policy_document.get('Statement', []):
            if stmt.get('Effect') != 'Allow':
                continue

            actions = stmt.get('Action', [])
            if not isinstance(actions, list):
                actions = [actions]

            has_dangerous_action = False
            for action in actions:
                if action in DANGEROUS_SES_ACTIONS:
                    has_dangerous_action = True
                    break
            
            if has_dangerous_action:
                resource = stmt.get('Resource', '*')
                is_resource_vulnerable = (resource == '*' or resource == ['*'])
                
                if is_resource_vulnerable:
                    vulnerable_statements.append(stmt)
                    
        return vulnerable_statements

    async def check(self) -> Dict:
        iam = self.session.client('iam')
        results = []
        raw = []
        vulnerable_principals = set()

        try:
            user_paginator = iam.get_paginator('list_users')
            for page in user_paginator.paginate():
                for user in page['Users']:
                    user_name = user['UserName']
                    user_arn = user['Arn']
                    
                    inline_policies = iam.list_user_policies(UserName=user_name).get('PolicyNames', [])
                    for policy_name in inline_policies:
                        response = iam.get_user_policy(UserName=user_name, PolicyName=policy_name)
                        policy_doc = response['PolicyDocument']
                        raw.append({"principal_arn": user_arn, "policy_name": policy_name, "policy_type": "inline", "document": policy_doc})
                        
                        vuln_stmts = self._find_vulnerable_statements(policy_doc)
                        if vuln_stmts:
                            vulnerable_principals.add(user_arn)
                            results.append(self.get_result(
                                'FAIL', user_name,
                                f"사용자 [{user_name}]의 인라인 정책 [{policy_name}]에 과도한 SES 권한이 있습니다.",
                                {"principal_arn": user_arn, "policy_name": policy_name, "vulnerable_statements": vuln_stmts}
                            ))

                    attached_policies = iam.list_attached_user_policies(UserName=user_name).get('AttachedPolicies', [])
                    for policy in attached_policies:
                        policy_arn = policy['PolicyArn']
                        if "awsmanaged" in policy_arn.lower(): 
                            continue 
                        
                        policy_details = iam.get_policy(PolicyArn=policy_arn)
                        version_id = policy_details['Policy']['DefaultVersionId']
                        policy_version = iam.get_policy_version(PolicyArn=policy_arn, VersionId=version_id)
                        policy_doc = policy_version['PolicyVersion']['Document']
                        raw.append({"principal_arn": user_arn, "policy_arn": policy_arn, "policy_type": "attached", "document": policy_doc})

                        vuln_stmts = self._find_vulnerable_statements(policy_doc)
                        if vuln_stmts:
                            vulnerable_principals.add(user_arn)
                            results.append(self.get_result(
                                'FAIL', user_name,
                                f"사용자 [{user_name}]에 연결된 정책 [{policy_arn}]에 과도한 SES 권한이 있습니다.",
                                {"principal_arn": user_arn, "policy_arn": policy_arn, "vulnerable_statements": vuln_stmts}
                            ))

            role_paginator = iam.get_paginator('list_roles')
            for page in role_paginator.paginate():
                for role in page['Roles']:
                    role_name = role['RoleName']
                    role_arn = role['Arn']
                    
                    inline_policies = iam.list_role_policies(RoleName=role_name).get('PolicyNames', [])
                    for policy_name in inline_policies:
                        response = iam.get_role_policy(RoleName=role_name, PolicyName=policy_name)
                        policy_doc = response['PolicyDocument']
                        raw.append({"principal_arn": role_arn, "policy_name": policy_name, "policy_type": "inline", "document": policy_doc})

                        vuln_stmts = self._find_vulnerable_statements(policy_doc)
                        if vuln_stmts:
                            vulnerable_principals.add(role_arn)
                            results.append(self.get_result(
                                'FAIL', role_name,
                                f"역할 [{role_name}]의 인라인 정책 [{policy_name}]에 과도한 SES 권한이 있습니다.",
                                {"principal_arn": role_arn, "policy_name": policy_name, "vulnerable_statements": vuln_stmts}
                            ))
                    
                    attached_policies = iam.list_attached_role_policies(RoleName=role_name).get('AttachedPolicies', [])
                    for policy in attached_policies:
                        policy_arn = policy['PolicyArn']
                        if "awsmanaged" in policy_arn.lower(): 
                            continue

                        policy_details = iam.get_policy(PolicyArn=policy_arn)
                        version_id = policy_details['Policy']['DefaultVersionId']
                        policy_version = iam.get_policy_version(PolicyArn=policy_arn, VersionId=version_id)
                        policy_doc = policy_version['PolicyVersion']['Document']
                        raw.append({"principal_arn": role_arn, "policy_arn": policy_arn, "policy_type": "attached", "document": policy_doc})

                        vuln_stmts = self._find_vulnerable_statements(policy_doc)
                        if vuln_stmts:
                            vulnerable_principals.add(role_arn)
                            results.append(self.get_result(
                                'FAIL', role_name,
                                f"역할 [{role_name}]에 연결된 정책 [{policy_arn}]에 과도한 SES 권한이 있습니다.",
                                {"principal_arn": role_arn, "policy_arn": policy_arn, "vulnerable_statements": vuln_stmts}
                            ))

            if not vulnerable_principals:
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "과도한 SES 권한(Resource: '*')을 가진 사용자나 역할이 없습니다."
                ))

        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', f"IAM 정책 조회 중 오류 발생: {str(e)}"))

        return {'results': results, 'raw': raw, 'guideline_id': 49}