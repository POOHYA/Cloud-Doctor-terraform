import json
from .base_check import BaseCheck
from typing import Dict

class OrganizationsSCPCheck(BaseCheck):
    async def check(self) -> Dict:
        organizations = self.session.client('organizations')
        results = []
        raw = []
        guideline_id = 33

        try:
            roots = organizations.list_roots().get('Roots', [])
            if not roots:
                results.append(self.get_result('ERROR', 'N/A', "AWS Organizations 루트를 찾을 수 없습니다."))
                return {'results': results, 'raw': raw, 'guideline_id': guideline_id}

            root_id = roots[0]['Id']

            attached_policies_response = organizations.list_policies_for_target(
                TargetId=root_id,
                Filter='SERVICE_CONTROL_POLICY'
            )
            attached_policies = attached_policies_response.get('Policies', [])

            raw.append({'root_id': root_id, 'attached_scps_summary': attached_policies})

            if not attached_policies:
                results.append(self.get_result(
                    'FAIL', root_id,
                    f"조직 루트 [{root_id}]에 서비스 제어 정책(SCP)이 연결되어 있지 않습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': guideline_id}

            found_any_custom_policy = False # FullAWSAccess 외 다른 정책 존재 여부

            for policy_summary in attached_policies:
                policy_id = policy_summary['Id']
                policy_name = policy_summary['Name']
                is_full_aws_access = (policy_id == 'p-FullAWSAccess')

                policy_content = None
                policy_content_error = None
                try:
                    policy_detail = organizations.describe_policy(PolicyId=policy_id)
                    policy_content_str = policy_detail.get('Policy', {}).get('Content', '{}')
                    policy_content = json.loads(policy_content_str)
                except Exception as e:
                    policy_content_error = str(e)
                    # 정책 내용 조회 오류 시에도 raw에는 기록하고 에러 결과 추가
                    raw.append({
                        'policy_id': policy_id, 'policy_name': policy_name,
                        'is_full_aws_access': is_full_aws_access,
                        'policy_content': None, 'error_fetching_content': policy_content_error
                    })
                    results.append(self.get_result('ERROR', policy_name, f"정책 [{policy_name}] ({policy_id}) 내용 조회 중 오류: {policy_content_error}"))
                    continue # 다음 정책으로

                # 모든 정책 내용을 raw 데이터에 추가
                raw.append({
                    'policy_id': policy_id, 'policy_name': policy_name,
                    'is_full_aws_access': is_full_aws_access,
                    'policy_content': policy_content,
                    'error_fetching_content': policy_content_error
                })

                # FullAWSAccess 정책은 개별 결과 추가 안 함
                if is_full_aws_access:
                    continue

                found_any_custom_policy = True # 사용자 정의 정책 발견

                # --- 개별 정책 판정 로직 ---
                policy_has_deny = False
                if policy_content:
                    for statement in policy_content.get('Statement', []):
                        if statement.get('Effect') == 'Deny':
                            policy_has_deny = True
                            break

                if policy_has_deny:
                    # Deny 구문이 있으면 해당 정책은 PASS
                    results.append(self.get_result(
                        'PASS', policy_name, # Resource ID를 정책 이름으로
                        f"SCP 정책 [{policy_name}]에 Deny 설정이 포함되어 있습니다.",
                        { # 상세 정보에 정책 내용 포함
                            'policy_id': policy_id,
                            'policy_name': policy_name,
                            'policy_content': policy_content
                        }
                    ))
                else:
                    # Deny 구문이 없으면 해당 정책은 FAIL
                    results.append(self.get_result(
                        'FAIL', policy_name, # Resource ID를 정책 이름으로
                        f"SCP 정책 [{policy_name}]에 Deny 설정이 없습니다.",
                        { # 상세 정보에 정책 내용 포함
                            'policy_id': policy_id,
                            'policy_name': policy_name,
                            'policy_content': policy_content
                        }
                    ))
                # --- 개별 정책 판정 끝 ---

            # --- 추가: FullAWSAccess 외 정책이 아예 없는 경우 처리 ---
            if not found_any_custom_policy and len(attached_policies) > 0:
                 # attached_policies에는 FullAWSAccess만 있다는 의미
                 results.append(self.get_result(
                    'FAIL', root_id, # 전체 상태에 대한 결과이므로 루트 ID 사용
                    f"조직 루트 [{root_id}]에 기본 FullAWSAccess 정책 외 보호용 SCP(Deny 설정)가 연결되어 있지 않습니다."
                ))
            # --- 추가 끝 ---


        except organizations.exceptions.AccessDeniedException:
             results.append(self.get_result('ERROR', 'N/A', "AWS Organizations API 접근 권한이 없습니다. 관리 계정에서 실행해야 합니다."))
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', f"AWS Organizations 정보 조회 중 오류 발생: {str(e)}"))

        return {'results': results, 'raw': raw, 'guideline_id': 33}