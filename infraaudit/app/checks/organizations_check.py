from .base_check import BaseCheck
from datetime import datetime
from typing import List, Dict
import json

class OrganizationsSCPCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        organizations = self.session.client('organizations')
        results = []
        raw = []
        
        try:
            policies = organizations.list_policies(Filter='SERVICE_CONTROL_POLICY')
            
            if not policies['Policies']:
                results.append(self.get_result(
                    '취약', 'N/A',
                    "서비스 제어 정책(SCP)이 설정되지 않았습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 33}
            
            has_deny_policy = False
            
            for policy in policies['Policies']:
                policy_id = policy['Id']
                policy_name = policy['Name']
                
                try:
                    policy_detail = organizations.describe_policy(PolicyId=policy_id)
                    policy_content = json.loads(policy_detail['Policy']['Content'])
                    
                    raw.append({
                        'policy_id': policy_id,
                        'policy_name': policy_name,
                        'policy_content': policy_content
                    })
                    
                    denied_actions = []
                    
                    for statement in policy_content.get('Statement', []):
                        effect = statement.get('Effect', '')
                        actions = statement.get('Action', [])
                        
                        if effect == 'Deny':
                            has_deny_policy = True
                            if isinstance(actions, str):
                                actions = [actions]
                            denied_actions.extend(actions)
                    
                    if denied_actions:
                        results.append(self.get_result(
                            '양호', policy_name,
                            f"SCP 정책 {policy_name}에서 다음 작업들이 제한되어 있습니다: {', '.join(denied_actions[:10])}{'...' if len(denied_actions) > 10 else ''}",
                            {
                                'policy_name': policy_name,
                                'denied_actions': denied_actions,
                                'policy_content': policy_content
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            '취약', policy_name,
                            f"SCP 정책 {policy_name}에 Deny 설정이 없습니다.",
                            {
                                'policy_name': policy_name,
                                'policy_content': policy_content
                            }
                        ))
                        
                except Exception as e:
                    results.append(self.get_result('ERROR', policy_name, f"정책 {policy_name} 확인 중 오류: {str(e)}"))
            
            if not has_deny_policy:
                results.append(self.get_result(
                    '취약', 'N/A',
                    "보호용 SCP 정책(Deny 설정)이 설정되지 않았습니다."
                ))
                    
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 33}