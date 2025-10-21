from .base_check import BaseCheck
from datetime import datetime
from typing import List, Dict

class IAMSSMCommandPolicyCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        iam = self.session.client('iam')
        results = []
        raw = []
        
        try:
            policies = iam.list_policies(Scope='All', MaxItems=1000)
            
            if not policies['Policies']:
                results.append(self.get_result(
                    '양호', 'N/A',
                    "IAM 정책이 존재하지 않습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 35}
            
            dangerous_documents = ['AWS-RunShellScript', 'AWS-RunPowerShellScript']
            
            for policy in policies['Policies']:
                policy_name = policy['PolicyName']
                policy_arn = policy['Arn']
                
                try:
                    policy_version = iam.get_policy_version(
                        PolicyArn=policy_arn,
                        VersionId=policy['DefaultVersionId']
                    )
                    
                    policy_document = policy_version['PolicyVersion']['Document']
                    
                    raw.append({
                        'policy_name': policy_name,
                        'policy_arn': policy_arn,
                        'policy_document': policy_document
                    })
                    
                    vulnerable = False
                    issues = []
                    
                    for statement in policy_document.get('Statement', []):
                        effect = statement.get('Effect', '')
                        actions = statement.get('Action', [])
                        principal = statement.get('Principal', {})
                        resource = statement.get('Resource', [])
                        condition = statement.get('Condition', {})
                        
                        if effect == 'Allow':
                            if isinstance(actions, str):
                                actions = [actions]
                            
                            # ssm:SendCommand 권한 확인
                            has_send_command = any('ssm:SendCommand' in action or action == '*' for action in actions)
                            
                            if has_send_command:
                                # Principal이 "*"인지 확인
                                if principal == "*" or (isinstance(principal, dict) and principal.get('AWS') == "*"):
                                    vulnerable = True
                                    issues.append("ssm:SendCommand가 Principal '*'로 허용됨")
                                
                                # Resource가 "*"인지 확인
                                if isinstance(resource, str):
                                    resource = [resource]
                                if "*" in resource:
                                    vulnerable = True
                                    issues.append("ssm:SendCommand가 Resource '*'로 허용됨")
                                
                                # 위험한 문서 실행 가능 여부 및 조건 확인
                                if not condition:
                                    vulnerable = True
                                    issues.append("ssm:SendCommand에 대상 인스턴스 제한 조건이 없음")
                                else:
                                    # 태그나 리소스 ARN 조건이 있는지 확인
                                    has_restriction = any(
                                        key in condition for key in [
                                            'StringEquals', 'StringLike', 'ForAllValues:StringEquals',
                                            'aws:RequestedRegion', 'ec2:ResourceTag'
                                        ]
                                    )
                                    if not has_restriction:
                                        vulnerable = True
                                        issues.append("ssm:SendCommand에 적절한 제한 조건이 없음")
                    
                    if vulnerable:
                        results.append(self.get_result(
                            'FAIL', policy_name,
                            f"정책 {policy_name}에서 ssm:SendCommand 권한이 과도하게 허용되어 있습니다: {', '.join(issues)}",
                            {
                                'policy_name': policy_name,
                                'policy_document': policy_document,
                                'issues': issues
                            }
                        ))
                    else:
                        # ssm:SendCommand가 있는 정책만 양호로 표시
                        has_ssm_command = any(
                            any('ssm:SendCommand' in action for action in (stmt.get('Action', []) if isinstance(stmt.get('Action', []), list) else [stmt.get('Action', '')]))
                            for stmt in policy_document.get('Statement', [])
                            if stmt.get('Effect') == 'Allow'
                        )
                        
                        if has_ssm_command:
                            results.append(self.get_result(
                                'PASS', policy_name,
                                f"정책 {policy_name}의 ssm:SendCommand 권한이 적절히 제한되어 있습니다.",
                                {
                                    'policy_name': policy_name,
                                    'policy_document': policy_document
                                }
                            ))
                        
                except Exception as e:
                    results.append(self.get_result('ERROR', policy_name, f"정책 {policy_name} 확인 중 오류: {str(e)}"))
                    
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 35}
    
class SSMDocumentPublicAccessCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        ssm = self.session.client('ssm')
        results = []
        raw = []
        
        try:
            documents = ssm.list_documents(Filters=[{'Key': 'Owner', 'Values': ['Self']}])
            
            if not documents.get('DocumentIdentifiers'):
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "소유한 SSM 문서가 없습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 46}
            
            for doc in documents['DocumentIdentifiers']:
                doc_name = doc.get('Name')
                
                try:
                    # 문서 권한 조회
                    permissions = ssm.describe_document_permission(
                        Name=doc_name,
                        PermissionType='Share'
                    )
                    
                    account_ids = permissions.get('AccountIds', [])
                    is_public = 'all' in account_ids
                    
                    raw.append({
                        'document_name': doc_name,
                        'account_ids': account_ids,
                        'is_public': is_public,
                        'document_data': doc
                    })
                    
                    if is_public:
                        results.append(self.get_result(
                            'FAIL', doc_name,
                            f"SSM 문서 {doc_name}이 퍼블릭으로 공유되어 있습니다.",
                            {
                                'document_name': doc_name,
                                'is_public': True,
                                'account_ids': account_ids
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            'PASS', doc_name,
                            f"SSM 문서 {doc_name}은 프라이빗으로 설정되어 있습니다.",
                            {
                                'document_name': doc_name,
                                'is_public': False,
                                'account_ids': account_ids
                            }
                        ))
                
                except Exception as e:
                    results.append(self.get_result('ERROR', doc_name, str(e)))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 46}