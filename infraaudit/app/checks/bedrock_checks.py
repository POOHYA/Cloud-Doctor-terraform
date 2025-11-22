from .base_check import BaseCheck
from typing import List, Dict

class BedrockModelAccessCheck(BaseCheck):
    """Bedrock 모델 접근 권한 점검"""
    
    def _find_vulnerable_bedrock_statements(self, policy_document: Dict) -> List[Dict]:
        vulnerable_statements = []
        
        DANGEROUS_BEDROCK_ACTIONS = {
            'bedrock:*', 'bedrock:InvokeModel', 'bedrock:List*',
            'bedrock:CreateModelCustomizationJob', 'bedrock:GetFoundationModel',
            'bedrock:ListFoundationModels', 'bedrock:InvokeModelWithResponseStream'
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
                if action in DANGEROUS_BEDROCK_ACTIONS:
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
            # IAM 사용자 스캔
            user_paginator = iam.get_paginator('list_users')
            total_users = 0
            
            for page in user_paginator.paginate():
                for user in page['Users']:
                    total_users += 1
                    user_name = user['UserName']
                    user_arn = user['Arn']
                    
                    user_data = {
                        'type': 'user',
                        'name': user_name,
                        'arn': user_arn,
                        'vulnerable_policies': []
                    }
                    
                    # 인라인 정책 스캔
                    inline_policies = iam.list_user_policies(UserName=user_name).get('PolicyNames', [])
                    for policy_name in inline_policies:
                        response = iam.get_user_policy(UserName=user_name, PolicyName=policy_name)
                        policy_doc = response['PolicyDocument']
                        
                        vuln_stmts = self._find_vulnerable_bedrock_statements(policy_doc)
                        if vuln_stmts:
                            vulnerable_principals.add(user_arn)
                            user_data['vulnerable_policies'].append({
                                'name': policy_name,
                                'type': 'inline',
                                'vulnerable_statements': vuln_stmts
                            })
                            results.append(self.get_result(
                                'FAIL', user_name,
                                f"사용자 [{user_name}]의 인라인 정책 [{policy_name}]에 과도한 Bedrock 권한(Resource: '*')이 있습니다.",
                                {"principal_arn": user_arn, "policy_name": policy_name, "vulnerable_statements": vuln_stmts}
                            ))

                    # 연결된 정책 스캔
                    attached_policies = iam.list_attached_user_policies(UserName=user_name).get('AttachedPolicies', [])
                    for policy in attached_policies:
                        policy_arn = policy['PolicyArn']
                        if "aws:iam::aws:policy" in policy_arn:
                            continue
                            
                        policy_details = iam.get_policy(PolicyArn=policy_arn)
                        version_id = policy_details['Policy']['DefaultVersionId']
                        policy_version = iam.get_policy_version(PolicyArn=policy_arn, VersionId=version_id)
                        policy_doc = policy_version['PolicyVersion']['Document']

                        vuln_stmts = self._find_vulnerable_bedrock_statements(policy_doc)
                        if vuln_stmts:
                            vulnerable_principals.add(user_arn)
                            user_data['vulnerable_policies'].append({
                                'arn': policy_arn,
                                'type': 'attached',
                                'vulnerable_statements': vuln_stmts
                            })
                            results.append(self.get_result(
                                'FAIL', user_name,
                                f"사용자 [{user_name}]에 연결된 정책 [{policy_arn}]에 과도한 Bedrock 권한(Resource: '*')이 있습니다.",
                                {"principal_arn": user_arn, "policy_arn": policy_arn, "vulnerable_statements": vuln_stmts}
                            ))
                    
                    if user_data['vulnerable_policies']:
                        raw.append(user_data)

            # IAM 역할 스캔
            role_paginator = iam.get_paginator('list_roles')
            total_roles = 0
            
            for page in role_paginator.paginate():
                for role in page['Roles']:
                    total_roles += 1
                    role_name = role['RoleName']
                    role_arn = role['Arn']
                    
                    role_data = {
                        'type': 'role',
                        'name': role_name,
                        'arn': role_arn,
                        'vulnerable_policies': []
                    }
                    
                    # 인라인 정책 스캔
                    inline_policies = iam.list_role_policies(RoleName=role_name).get('PolicyNames', [])
                    for policy_name in inline_policies:
                        response = iam.get_role_policy(RoleName=role_name, PolicyName=policy_name)
                        policy_doc = response['PolicyDocument']

                        vuln_stmts = self._find_vulnerable_bedrock_statements(policy_doc)
                        if vuln_stmts:
                            vulnerable_principals.add(role_arn)
                            role_data['vulnerable_policies'].append({
                                'name': policy_name,
                                'type': 'inline',
                                'vulnerable_statements': vuln_stmts
                            })
                            results.append(self.get_result(
                                'FAIL', role_name,
                                f"역할 [{role_name}]의 인라인 정책 [{policy_name}]에 과도한 Bedrock 권한(Resource: '*')이 있습니다.",
                                {"principal_arn": role_arn, "policy_name": policy_name, "vulnerable_statements": vuln_stmts}
                            ))
                    
                    # 연결된 정책 스캔
                    attached_policies = iam.list_attached_role_policies(RoleName=role_name).get('AttachedPolicies', [])
                    for policy in attached_policies:
                        policy_arn = policy['PolicyArn']
                        if "aws:iam::aws:policy" in policy_arn:
                            continue

                        policy_details = iam.get_policy(PolicyArn=policy_arn)
                        version_id = policy_details['Policy']['DefaultVersionId']
                        policy_version = iam.get_policy_version(PolicyArn=policy_arn, VersionId=version_id)
                        policy_doc = policy_version['PolicyVersion']['Document']

                        vuln_stmts = self._find_vulnerable_bedrock_statements(policy_doc)
                        if vuln_stmts:
                            vulnerable_principals.add(role_arn)
                            role_data['vulnerable_policies'].append({
                                'arn': policy_arn,
                                'type': 'attached',
                                'vulnerable_statements': vuln_stmts
                            })
                            results.append(self.get_result(
                                'FAIL', role_name,
                                f"역할 [{role_name}]에 연결된 정책 [{policy_arn}]에 과도한 Bedrock 권한(Resource: '*')이 있습니다.",
                                {"principal_arn": role_arn, "policy_arn": policy_arn, "vulnerable_statements": vuln_stmts}
                            ))
                    
                    if role_data['vulnerable_policies']:
                        raw.append(role_data)

            # 스캔 요약
            scan_summary = {
                'type': 'bedrock_scan_summary',
                'total_users': total_users,
                'total_roles': total_roles,
                'vulnerable_principals_count': len(vulnerable_principals)
            }
            raw.append(scan_summary)

            # 최종 결과 판정
            if not vulnerable_principals:
                results.append(self.get_result(
                    'PASS', 'N/A',
                    f"총 {total_users}명의 사용자와 {total_roles}개의 역할을 스캔했으나 과도한 Bedrock 권한(Resource: '*')을 가진 주체가 없습니다."
                ))

        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', f"IAM 정책 조회 중 오류 발생: {str(e)}"))

        return {'results': results, 'raw': raw, 'guideline_id': 50}