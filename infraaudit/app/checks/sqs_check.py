from .base_check import BaseCheck
from datetime import datetime
from typing import List, Dict
import json

class SQSAccessPolicyCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        sqs = self.session.client('sqs')
        iam = self.session.client('iam')
        results = []
        raw = []
        
        try:
            # 현재 계정의 활성 사용자 목록 조회
            active_users = set()
            try:
                users = iam.list_users()
                for user in users['Users']:
                    active_users.add(user['Arn'])
            except Exception:
                pass
            
            queues = sqs.list_queues()
            
            if 'QueueUrls' not in queues:
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "SQS 큐가 존재하지 않습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 1}
            
            for queue_url in queues['QueueUrls']:
                try:
                    attributes = sqs.get_queue_attributes(
                        QueueUrl=queue_url,
                        AttributeNames=['Policy', 'QueueArn']
                    )
                    
                    queue_arn = attributes['Attributes'].get('QueueArn', queue_url)
                    policy_str = attributes['Attributes'].get('Policy')
                    
                    if not policy_str:
                        results.append(self.get_result(
                            'PASS', queue_arn,
                            f"큐 {queue_arn}에 액세스 정책이 설정되지 않았습니다.",
                            {'policy': None}
                        ))
                        continue
                    
                    policy = json.loads(policy_str)
                    raw.append({
                        'queue_url': queue_url,
                        'queue_arn': queue_arn,
                        'policy': policy
                    })
                    
                    vulnerable = False
                    issues = []
                    
                    for statement in policy.get('Statement', []):
                        principal = statement.get('Principal', {})
                        
                        # Principal이 "*"인 경우
                        if principal == "*":
                            vulnerable = True
                            issues.append("Principal이 '*'로 설정됨")
                        elif isinstance(principal, dict):
                            aws_principals = principal.get('AWS', [])
                            if isinstance(aws_principals, str):
                                aws_principals = [aws_principals]
                            
                            for arn in aws_principals:
                                if arn == "*":
                                    vulnerable = True
                                    issues.append("AWS Principal이 '*'로 설정됨")
                                elif arn.startswith('arn:aws:iam::') and ':user/' in arn:
                                    # 사용자 ARN이 활성 사용자 목록에 없는 경우
                                    if arn not in active_users:
                                        vulnerable = True
                                        issues.append(f"사용하지 않는 사용자 ARN: {arn}")
                    
                    if vulnerable:
                        results.append(self.get_result(
                            'FAIL', queue_arn,
                            f"큐 {queue_arn}의 액세스 정책에서 부적절한 Principal 설정이 발견되었습니다: {', '.join(issues)}. 액세스 정책에서 Principal을 특정 계정/역할/서비스 ARN으로만 제한해야 합니다.",
                            {
                                'policy': policy,
                                'issues': issues
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            'PASS', queue_arn,
                            f"큐 {queue_arn}의 액세스 정책이 적절히 설정되어 있습니다.",
                            {'policy': policy}
                        ))
                        
                except Exception as e:
                    results.append(self.get_result('오류', queue_url, f"큐 {queue_url} 정책 확인 중 오류: {str(e)}"))
                    
        except Exception as e:
            results.append(self.get_result('오류', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 30}
