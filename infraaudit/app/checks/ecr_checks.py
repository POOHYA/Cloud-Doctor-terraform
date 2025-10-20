from .base_check import BaseCheck
from typing import List, Dict
from datetime import datetime
import json

class ECRRepositorySecurityCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        ecr = self.session.client('ecr')
        results = []
        raw = []
        
        try:
            repositories = ecr.describe_repositories()
            
            if not repositories.get('repositories'):
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "ECR 리포지토리가 없습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 43}
            
            for repo in repositories['repositories']:
                repo_name = repo.get('repositoryName')
                repo_arn = repo.get('repositoryArn')
                
                # 리포지토리 정책 조회
                policy_str = None
                try:
                    policy_response = ecr.get_repository_policy(repositoryName=repo_name)
                    policy_str = policy_response.get('repositoryPolicy')
                except ecr.exceptions.RepositoryPolicyNotFoundException:
                    policy_str = None
                
                # 이미지 스캔 활성화 여부
                image_scan_enabled = repo.get('imageScanningConfiguration', {}).get('scanOnPush', False)
                
                # 태그 불변 여부
                image_tag_mutability = repo.get('imageTagMutability', 'MUTABLE')
                tag_immutable_enabled = image_tag_mutability == 'IMMUTABLE'
                
                violations = []
                
                # 정책 검사
                if policy_str:
                    policy = json.loads(policy_str)
                    statements = policy.get('Statement', [])
                    
                    for statement in statements:
                        if statement.get('Effect') != 'Allow':
                            continue
                        
                        principal = statement.get('Principal', {})
                        actions = statement.get('Action', [])
                        if isinstance(actions, str):
                            actions = [actions]
                        
                        # Principal이 "*"인지 확인
                        is_wildcard_principal = principal == '*' or principal.get('AWS') == '*' or principal.get('Service') == '*'
                        
                        # Push/Pull 권한 확인
                        push_actions = ['ecr:InitiateLayerUpload', 'ecr:UploadLayerPart', 'ecr:CompleteLayerUpload', 'ecr:PutImage', 'ecr:BatchCheckLayerAvailability']
                        pull_actions = ['ecr:GetDownloadUrlForLayer', 'ecr:BatchGetImage']
                        
                        has_push = any(action in actions or action == 'ecr:*' or action == '*' for action in push_actions)
                        has_pull = any(action in actions or action == 'ecr:*' or action == '*' for action in pull_actions)
                        
                        # 와일드카드 주체 + Push/Pull 권한 확인
                        if is_wildcard_principal and (has_push or has_pull):
                            violations.append({
                                'type': '와일드카드 주체에 Push/Pull 권한 허용',
                                'principal': str(principal),
                                'has_push': has_push,
                                'has_pull': has_pull
                            })
                else:
                    # 정책이 없으면 기본적으로 제한됨
                    pass
                
                # 이미지 스캔 비활성화 확인
                if not image_scan_enabled:
                    violations.append({
                        'type': '이미지 스캔 비활성화'
                    })
                
                # 태그 불변 비활성화 확인
                if not tag_immutable_enabled:
                    violations.append({
                        'type': '태그 불변 비활성화'
                    })
                
                raw.append({
                    'repo_name': repo_name,
                    'repo_arn': repo_arn,
                    'policy': policy_str,
                    'image_scan_enabled': image_scan_enabled,
                    'tag_immutable_enabled': tag_immutable_enabled,
                    'violations': violations,
                    'repo_data': repo
                })
                
                if violations:
                    violation_messages = [v.get('type') for v in violations]
                    results.append(self.get_result(
                        'FAIL', repo_name,
                        f"ECR 리포지토리 {repo_name}에서 다음 보안 문제가 발견되었습니다: {', '.join(violation_messages)}",
                        {
                            'repo_name': repo_name,
                            'image_scan_enabled': image_scan_enabled,
                            'tag_immutable_enabled': tag_immutable_enabled,
                            'violations': violations
                        }
                    ))
                else:
                    results.append(self.get_result(
                        'PASS', repo_name,
                        f"ECR 리포지토리 {repo_name}은 보안 정책이 적절하게 구성되어 있습니다.",
                        {
                            'repo_name': repo_name,
                            'image_scan_enabled': image_scan_enabled,
                            'tag_immutable_enabled': tag_immutable_enabled
                        }
                    ))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 43}