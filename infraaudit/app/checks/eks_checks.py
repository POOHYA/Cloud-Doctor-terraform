from typing import List, Dict
import json
from .base_check import BaseCheck

class EKSIRSARoleCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        iam = self.session.client('iam')
        results = []
        raw = []
        
        try:
            # IRSA용 역할 조회 (Trust Policy에 oidc.eks가 포함된 역할)
            roles_response = iam.list_roles()
            roles = roles_response.get('Roles', [])
            
            irsa_roles = []
            for role in roles:
                role_name = role['RoleName']
                assume_role_policy = role.get('AssumeRolePolicyDocument', {})
                
                # Trust Policy를 문자열로 변환하여 확인
                trust_policy_str = json.dumps(assume_role_policy)
                
                # OIDC provider (EKS IRSA)가 포함된 역할만 필터링
                if 'oidc.eks' in trust_policy_str or 'sts:AssumeRoleWithWebIdentity' in trust_policy_str:
                    irsa_roles.append(role)
            
            if not irsa_roles:
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "EKS IRSA용 IAM 역할이 존재하지 않습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': None}
            
            for role in irsa_roles:
                role_name = role['RoleName']
                role_arn = role['Arn']
                
                try:
                    # 역할에 연결된 정책 조회
                    attached_policies = iam.list_attached_role_policies(RoleName=role_name)
                    inline_policies = iam.list_role_policies(RoleName=role_name)
                    
                    has_admin_policy = False
                    vulnerable_policies = []
                    
                    # 관리형 정책 확인
                    for policy in attached_policies.get('AttachedPolicies', []):
                        policy_arn = policy['PolicyArn']
                        policy_name = policy['PolicyName']
                        
                        # AdministratorAccess 정책 확인
                        if 'AdministratorAccess' in policy_name:
                            has_admin_policy = True
                            vulnerable_policies.append({
                                'type': 'managed',
                                'name': policy_name,
                                'arn': policy_arn
                            })
                            continue
                        
                        # 정책 버전 조회
                        try:
                            policy_version = iam.get_policy(PolicyArn=policy_arn)
                            default_version_id = policy_version['Policy']['DefaultVersionId']
                            
                            policy_document = iam.get_policy_version(
                                PolicyArn=policy_arn,
                                VersionId=default_version_id
                            )
                            
                            statements = policy_document['PolicyVersion']['Document'].get('Statement', [])
                            
                            # Action: "*", Resource: "*" 확인
                            for statement in statements:
                                if statement.get('Effect') == 'Allow':
                                    actions = statement.get('Action', [])
                                    resources = statement.get('Resource', [])
                                    
                                    if isinstance(actions, str):
                                        actions = [actions]
                                    if isinstance(resources, str):
                                        resources = [resources]
                                    
                                    if '*' in actions and '*' in resources:
                                        has_admin_policy = True
                                        vulnerable_policies.append({
                                            'type': 'managed',
                                            'name': policy_name,
                                            'arn': policy_arn,
                                            'reason': 'Action:* and Resource:*'
                                        })
                                        break
                        except Exception:
                            pass
                    
                    # 인라인 정책 확인
                    for policy_name in inline_policies.get('PolicyNames', []):
                        try:
                            policy_document = iam.get_role_policy(
                                RoleName=role_name,
                                PolicyName=policy_name
                            )
                            
                            statements = policy_document['PolicyDocument'].get('Statement', [])
                            
                            for statement in statements:
                                if statement.get('Effect') == 'Allow':
                                    actions = statement.get('Action', [])
                                    resources = statement.get('Resource', [])
                                    
                                    if isinstance(actions, str):
                                        actions = [actions]
                                    if isinstance(resources, str):
                                        resources = [resources]
                                    
                                    if '*' in actions and '*' in resources:
                                        has_admin_policy = True
                                        vulnerable_policies.append({
                                            'type': 'inline',
                                            'name': policy_name,
                                            'reason': 'Action:* and Resource:*'
                                        })
                                        break
                        except Exception:
                            pass
                    
                    raw.append({
                        'role_name': role_name,
                        'role_arn': role_arn,
                        'has_admin_policy': has_admin_policy,
                        'vulnerable_policies': vulnerable_policies,
                        'attached_policies': attached_policies.get('AttachedPolicies', []),
                        'inline_policies': inline_policies.get('PolicyNames', [])
                    })
                    
                    if has_admin_policy:
                        results.append(self.get_result(
                            'FAIL', role_name,
                            f"EKS IRSA 역할 {role_name}이 관리자급 권한(Action:*, Resource:*)을 가지고 있습니다.",
                            {
                                'role_arn': role_arn,
                                'vulnerable_policies': vulnerable_policies
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            'PASS', role_name,
                            f"EKS IRSA 역할 {role_name}은 최소 권한 원칙을 따르고 있습니다.",
                            {
                                'role_arn': role_arn
                            }
                        ))
                
                except Exception as e:
                    results.append(self.get_result(
                        'ERROR', role_name,
                        f"역할 {role_name} 점검 중 오류 발생: {str(e)}"
                    ))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 27}
