from .base_check import BaseCheck
from datetime import datetime
from typing import List, Dict
import json

class SNSAccessPolicyCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        sns = self.session.client('sns')
        results = []
        raw = []
        
        try:
            topics = sns.list_topics()
            
            if not topics['Topics']:
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "SNS 주제가 존재하지 않습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 29}
            
            for topic in topics['Topics']:
                topic_arn = topic['TopicArn']
                
                try:
                    attributes = sns.get_topic_attributes(TopicArn=topic_arn)
                    policy_str = attributes['Attributes'].get('Policy')
                    
                    if not policy_str:
                        results.append(self.get_result(
                            'PASS', topic_arn,
                            f"주제 {topic_arn}에 액세스 정책이 설정되지 않았습니다.",
                            {'policy': None}
                        ))
                        continue
                    
                    policy = json.loads(policy_str)
                    raw.append({
                        'topic_arn': topic_arn,
                        'policy': policy
                    })
                    
                    vulnerable = False
                    issues = []
                    
                    for statement in policy.get('Statement', []):
                        principal = statement.get('Principal', {})
                        resource = statement.get('Resource', [])
                        action = statement.get('Action', [])
                        
                        # SNS 관련 액션 확인
                        sns_actions = []
                        if isinstance(action, str):
                            if 'sns:' in action.lower():
                                sns_actions.append(action)
                        elif isinstance(action, list):
                            sns_actions = [a for a in action if isinstance(a, str) and 'sns:' in a.lower()]
                        
                        if sns_actions:
                            # Principal 확인
                            if principal == "*" or (isinstance(principal, dict) and principal.get('AWS') == "*"):
                                vulnerable = True
                                issues.append(f"Principal이 '*'로 설정됨 (액션: {sns_actions})")
                            
                            # Resource 확인
                            if resource == "*" or (isinstance(resource, list) and "*" in resource):
                                vulnerable = True
                                issues.append(f"Resource가 '*'로 설정됨 (액션: {sns_actions})")
                    
                    if vulnerable:
                        results.append(self.get_result(
                            'FAIL', topic_arn,
                            f"주제 {topic_arn}의 액세스 정책에서 과도한 권한이 설정되어 있습니다: {', '.join(issues)}. SNS 주제 액세스 정책에서 sns:Publish, sns:Subscribe 등의 SNS 관련 권한을 Principal은 특정 계정/역할/사용자 ARN으로 고정하고, Resource는 해당 주제의 ARN으로 고정해야 합니다.",
                            {
                                'policy': policy,
                                'issues': issues
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            'PASS', topic_arn,
                            f"주제 {topic_arn}의 액세스 정책이 적절히 제한되어 있습니다.",
                            {'policy': policy}
                        ))
                        
                except Exception as e:
                    results.append(self.get_result('오류', topic_arn, f"주제 {topic_arn} 정책 확인 중 오류: {str(e)}"))
                    
        except Exception as e:
            results.append(self.get_result('오류', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 29} 
    
class SNSTopicAccessPolicyCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        sns = self.session.client('sns')
        results = []
        raw = []
        
        try:
            topics = sns.list_topics()
            
            if not topics.get('Topics'):
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "SNS 주제가 없습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 38}
            
            for topic in topics['Topics']:
                topic_arn = topic['TopicArn']
                topic_name = topic_arn.split(':')[-1]
                
                try:
                    # 주제 정책 조회
                    policy_response = sns.get_topic_attributes(
                        TopicArn=topic_arn
                    )
                    
                    policy_str = policy_response.get('Attributes', {}).get('Policy')
                    if not policy_str:
                        results.append(self.get_result(
                            'PASS', topic_name,
                            f"SNS 주제 {topic_name}에 정책이 없습니다.",
                            {
                                'topic_arn': topic_arn,
                                'has_policy': False
                            }
                        ))
                        raw.append({
                            'topic_arn': topic_arn,
                            'topic_name': topic_name,
                            'has_policy': False,
                            'policy': None
                        })
                        continue
                    
                    policy = json.loads(policy_str)
                    statements = policy.get('Statement', [])
                    
                    is_properly_restricted = True
                    violation_reasons = []
                    
                    for statement in statements:
                        # Allow 문장만 검사
                        if statement.get('Effect') != 'Allow':
                            continue
                        
                        # Principal 검사
                        principal = statement.get('Principal', {})
                        has_restricted_principal = self._is_principal_restricted(principal)
                        
                        # Resource 검사
                        resource = statement.get('Resource', [])
                        if isinstance(resource, str):
                            resource = [resource]
                        has_restricted_resource = all(r == topic_arn or r == '*' for r in resource)
                        
                        # SNS 관련 권한 검사
                        actions = statement.get('Action', [])
                        if isinstance(actions, str):
                            actions = [actions]
                        
                        has_sns_permission = any(
                            action.lower().startswith('sns:') 
                            for action in actions
                        )
                        
                        # Principal이 "*"이거나 특정 계정/역할/사용자로 제한되지 않으면 FAIL
                        if has_sns_permission and (not has_restricted_principal or principal.get('AWS') == '*'):
                            is_properly_restricted = False
                            violation_reasons.append("Principal이 제한되지 않음 또는 와일드카드 사용")
                        
                        # Resource가 해당 주제의 ARN이 아니거나 "*"이면 FAIL
                        if has_sns_permission and not has_restricted_resource:
                            is_properly_restricted = False
                            violation_reasons.append("Resource가 해당 주제 ARN으로 제한되지 않음")
                    
                    raw.append({
                        'topic_arn': topic_arn,
                        'topic_name': topic_name,
                        'has_policy': True,
                        'policy': policy,
                        'is_properly_restricted': is_properly_restricted,
                        'violation_reasons': violation_reasons
                    })
                    
                    if is_properly_restricted:
                        results.append(self.get_result(
                            'PASS', topic_name,
                            f"SNS 주제 {topic_name}의 액세스 정책은 적절하게 제한되어 있습니다.",
                            {
                                'topic_arn': topic_arn,
                                'is_properly_restricted': True
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            'FAIL', topic_name,
                            f"SNS 주제 {topic_name}의 액세스 정책이 과도하게 개방되어 있습니다: {', '.join(violation_reasons)}",
                            {
                                'topic_arn': topic_arn,
                                'is_properly_restricted': False,
                                'violation_reasons': violation_reasons
                            }
                        ))
                
                except Exception as e:
                    results.append(self.get_result(
                        'ERROR', topic_name,
                        f"주제 {topic_name} 정책 조회 중 오류: {str(e)}"
                    ))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 38}
    
    def _is_principal_restricted(self, principal: Dict) -> bool:
        """Principal이 특정 계정/역할/사용자로 제한되어 있는지 확인"""
        if not principal:
            return False
        
        # Principal이 AWS 키를 가지고 있는지 확인
        if 'AWS' in principal:
            aws_principal = principal['AWS']
            
            # 문자열인 경우
            if isinstance(aws_principal, str):
                # "*"이거나 와일드카드가 포함되면 제한되지 않음
                if aws_principal == '*' or '*' in aws_principal:
                    return False
                # ARN 형식이면 제한됨 (계정, 역할, 사용자)
                if aws_principal.startswith('arn:aws:'):
                    return True
            
            # 리스트인 경우
            elif isinstance(aws_principal, list):
                # 모든 항목이 "*" 또는 와일드카드가 아니어야 함
                for p in aws_principal:
                    if p == '*' or (isinstance(p, str) and '*' in p):
                        return False
                # 모든 항목이 ARN 형식이면 제한됨
                if all(isinstance(p, str) and p.startswith('arn:aws:') for p in aws_principal):
                    return True
        
        return False
