from .base_check import BaseCheck
from datetime import datetime
from typing import List, Dict
import json

class IAMGluePassRoleCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        iam = self.session.client('iam')
        results = []
        raw = []
        
        try:
            roles = iam.list_roles(MaxItems=1000)
            
            if not roles['Roles']:
                return {'results': results, 'raw': raw, 'guideline_id': 45}
            
            for role in roles['Roles']:
                role_name = role['RoleName']
                
                try:
                    attached_policies = iam.list_attached_role_policies(RoleName=role_name)
                    inline_policies = iam.list_role_policies(RoleName=role_name)
                    
                    has_glue_create = False
                    has_pass_role = False
                    all_policies = []
                    
                    # 관리형 정책 확인
                    for policy in attached_policies['AttachedPolicies']:
                        try:
                            policy_version = iam.get_policy_version(
                                PolicyArn=policy['PolicyArn'],
                                VersionId=iam.get_policy(PolicyArn=policy['PolicyArn'])['Policy']['DefaultVersionId']
                            )
                            
                            policy_doc = policy_version['PolicyVersion']['Document']
                            all_policies.append({
                                'type': 'managed',
                                'name': policy['PolicyName'],
                                'document': policy_doc
                            })
                            
                            for statement in policy_doc.get('Statement', []):
                                if statement.get('Effect') == 'Allow':
                                    actions = statement.get('Action', [])
                                    if isinstance(actions, str):
                                        actions = [actions]
                                    
                                    for action in actions:
                                        if 'glue:CreateDevEndpoint' in action or action == '*':
                                            has_glue_create = True
                                        if 'iam:PassRole' in action or action == '*':
                                            has_pass_role = True
                        except Exception:
                            pass
                    
                    # 인라인 정책 확인
                    for policy_name in inline_policies['PolicyNames']:
                        try:
                            policy_doc = iam.get_role_policy(RoleName=role_name, PolicyName=policy_name)
                            
                            all_policies.append({
                                'type': 'inline',
                                'name': policy_name,
                                'document': policy_doc['PolicyDocument']
                            })
                            
                            for statement in policy_doc['PolicyDocument'].get('Statement', []):
                                if statement.get('Effect') == 'Allow':
                                    actions = statement.get('Action', [])
                                    if isinstance(actions, str):
                                        actions = [actions]
                                    
                                    for action in actions:
                                        if 'glue:CreateDevEndpoint' in action or action == '*':
                                            has_glue_create = True
                                        if 'iam:PassRole' in action or action == '*':
                                            has_pass_role = True
                        except Exception:
                            pass
                    
                    raw.append({
                        'role_name': role_name,
                        'has_glue_create': has_glue_create,
                        'has_pass_role': has_pass_role,
                        'all_policies': all_policies
                    })
                    
                    if has_glue_create and has_pass_role:
                        results.append(self.get_result(
                            'FAIL', role_name,
                            f"역할 {role_name}에 glue:CreateDevEndpoint와 iam:PassRole 권한이 동시에 부여되어 있습니다. 두 권한을 역할별로 분리해야 합니다.",
                            {
                                'role_name': role_name,
                                'has_glue_create': has_glue_create,
                                'has_pass_role': has_pass_role,
                                'attached_policies_count': len(attached_policies['AttachedPolicies']),
                                'inline_policies_count': len(inline_policies['PolicyNames']),
                                'policy_documents': all_policies
                            }
                        ))
                    else:
                        if has_glue_create or has_pass_role:
                            results.append(self.get_result(
                                'PASS', role_name,
                                f"역할 {role_name}의 Glue/IAM 권한이 적절히 분리되어 있습니다.",
                                {
                                    'role_name': role_name,
                                    'has_glue_create': has_glue_create,
                                    'has_pass_role': has_pass_role,
                                    'attached_policies_count': len(attached_policies['AttachedPolicies']),
                                    'inline_policies_count': len(inline_policies['PolicyNames']),
                                    'policy_documents': all_policies
                                }
                            ))
                        
                except Exception as e:
                    results.append(self.get_result('ERROR', role_name, f"역할 {role_name} 확인 중 오류: {str(e)}"))
                    
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 45}