from .base_check import BaseCheck
from typing import List, Dict
import json

class ECRRepositorySecurityCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        results = []
        raw = []
        
        try:
            ecr = self.session.client('ecr')
            
            # 현재 리전 정보 확인
            current_region = ecr.meta.region_name
            raw.append({'current_region': current_region})
            
            # ECR 리포지토리 조회
            repositories = ecr.describe_repositories()
            
            if not repositories.get('repositories'):
                results.append(self.get_result(
                    'PASS', 'N/A',
                    f"ECR 리포지토리가 없습니다. (리전: {current_region})"
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 43}
            
            for repo in repositories['repositories']:
                repo_name = repo.get('repositoryName')
                repo_arn = repo.get('repositoryArn')
                
                # 리포지토리 정책 조회
                policy_str = None
                policy_check_skipped = False
                try:
                    policy_response = ecr.get_repository_policy(repositoryName=repo_name)
                    policy_str = policy_response.get('repositoryPolicy')
                except ecr.exceptions.RepositoryPolicyNotFoundException:
                    policy_str = None
                except Exception as policy_error:
                    # 권한 오류 등으로 정책 조회 실패
                    policy_check_skipped = True
                    policy_str = None
                
                # 이미지 스캔 활성화 여부
                image_scan_enabled = repo.get('imageScanningConfiguration', {}).get('scanOnPush', False)
                
                # 태그 불변 여부
                image_tag_mutability = repo.get('imageTagMutability', 'MUTABLE')
                tag_immutable_enabled = image_tag_mutability == 'IMMUTABLE'
                
                violations = []
                
                # 정책 검사
                if policy_check_skipped:
                    # 정책 검사를 건너뛴 경우 알림 추가
                    violations.append({
                        'type': '정책 검사 건너뛰 (권한 부족)'
                    })
                elif policy_str:
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
                    'policy_check_skipped': policy_check_skipped,
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
        
        except ecr.exceptions.ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            
            if error_code == 'UnauthorizedOperation':
                results.append(self.get_result(
                    'ERROR', 'N/A', 
                    f"ECR 접근 권한이 없습니다: {error_message}"
                ))
            else:
                results.append(self.get_result(
                    'ERROR', 'N/A', 
                    f"ECR 오류 ({error_code}): {error_message}"
                ))
        except Exception as e:
            results.append(self.get_result(
                'ERROR', 'N/A', 
                f"예상치 못한 오류: {str(e)}"
            ))
        
        return {'results': results, 'raw': raw, 'guideline_id': 43}