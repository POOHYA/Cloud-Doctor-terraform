from .base_check import BaseCheck
from typing import List, Dict

class AppStreamOverlyPermissiveCheck(BaseCheck):
    """AppStream 2.0 환경을 통한 과도한 권한 및 자격 증명 탈취"""

    def _find_vulnerable_statements(self, policy_document: Dict) -> List[Dict]:
        vulnerable_statements = []
        if not policy_document or 'Statement' not in policy_document:
            return []

        for stmt in policy_document.get('Statement', []):
            if stmt.get('Effect') != 'Allow':
                continue

            actions = stmt.get('Action', [])
            if not isinstance(actions, list):
                actions = [actions]

            resource = stmt.get('Resource', '*')
            is_resource_star = (resource == '*' or resource == ['*'])

            # 기준 1: AdministratorAccess 확인
            for action in actions:
                if action == '*' and is_resource_star:
                    vulnerable_statements.append(stmt)
                    break

            # 기준 2: 무제한 iam:PassRole 확인
            has_pass_role = any(action == 'iam:PassRole' for action in actions)
            if has_pass_role and is_resource_star:
                vulnerable_statements.append(stmt)

            # 기준 3: 무제한 sts:AssumeRole 확인
            has_assume_role = any(action == 'sts:AssumeRole' for action in actions)
            if has_assume_role and is_resource_star:
                vulnerable_statements.append(stmt)

        return vulnerable_statements

    async def check(self) -> Dict:
        results = []
        raw = []
        
        try:
            appstream = self.session.client('appstream')
            iam = self.session.client('iam')
            
            # AppStream 서비스 접근 시도
            try:
                fleets = appstream.describe_fleets().get('Fleets', [])
                image_builders = appstream.describe_image_builders().get('ImageBuilders', [])
                
                total_resources = len(fleets) + len(image_builders)
                vulnerable_count = 0
                
                # Fleet 스캔
                for fleet in fleets:
                    fleet_name = fleet['Name']
                    iam_role_arn = fleet.get('IamRoleArn')
                    
                    fleet_data = {
                        'type': 'fleet',
                        'name': fleet_name,
                        'iam_role_arn': iam_role_arn,
                        'vulnerable_policies': []
                    }
                    
                    if iam_role_arn:
                        role_name = iam_role_arn.split('/')[-1]
                        
                        try:
                            # 인라인 정책 스캔
                            inline_policies = iam.list_role_policies(RoleName=role_name).get('PolicyNames', [])
                            for policy_name in inline_policies:
                                response = iam.get_role_policy(RoleName=role_name, PolicyName=policy_name)
                                policy_doc = response['PolicyDocument']
                                
                                vuln_stmts = self._find_vulnerable_statements(policy_doc)
                                if vuln_stmts:
                                    vulnerable_count += 1
                                    fleet_data['vulnerable_policies'].append({
                                        'name': policy_name,
                                        'type': 'inline',
                                        'vulnerable_statements': vuln_stmts
                                    })
                                    results.append(self.get_result(
                                        'FAIL', fleet_name,
                                        f"AppStream Fleet [{fleet_name}] 역할의 인라인 정책 [{policy_name}]에 과도한 권한이 있습니다.",
                                        {"role_arn": iam_role_arn, "policy_name": policy_name, "vulnerable_statements": vuln_stmts}
                                    ))
                        except Exception as e:
                            fleet_data['error'] = str(e)
                    
                    raw.append(fleet_data)
                
                # Image Builder 스캔
                for builder in image_builders:
                    builder_name = builder['Name']
                    iam_role_arn = builder.get('IamRoleArn')
                    
                    builder_data = {
                        'type': 'image_builder',
                        'name': builder_name,
                        'iam_role_arn': iam_role_arn,
                        'vulnerable_policies': []
                    }
                    
                    if iam_role_arn:
                        role_name = iam_role_arn.split('/')[-1]
                        
                        try:
                            # 인라인 정책 스캔
                            inline_policies = iam.list_role_policies(RoleName=role_name).get('PolicyNames', [])
                            for policy_name in inline_policies:
                                response = iam.get_role_policy(RoleName=role_name, PolicyName=policy_name)
                                policy_doc = response['PolicyDocument']
                                
                                vuln_stmts = self._find_vulnerable_statements(policy_doc)
                                if vuln_stmts:
                                    vulnerable_count += 1
                                    builder_data['vulnerable_policies'].append({
                                        'name': policy_name,
                                        'type': 'inline',
                                        'vulnerable_statements': vuln_stmts
                                    })
                                    results.append(self.get_result(
                                        'FAIL', builder_name,
                                        f"AppStream Image Builder [{builder_name}] 역할의 인라인 정책 [{policy_name}]에 과도한 권한이 있습니다.",
                                        {"role_arn": iam_role_arn, "policy_name": policy_name, "vulnerable_statements": vuln_stmts}
                                    ))
                        except Exception as e:
                            builder_data['error'] = str(e)
                    
                    raw.append(builder_data)
                
                # 스캔 요약
                scan_summary = {
                    'type': 'appstream_scan_summary',
                    'total_fleets': len(fleets),
                    'total_image_builders': len(image_builders),
                    'total_resources': total_resources,
                    'vulnerable_count': vulnerable_count
                }
                raw.append(scan_summary)
                
                # 최종 결과 판정
                if total_resources == 0:
                    results.append(self.get_result('PASS', 'N/A', "점검할 AppStream Fleet 또는 Image Builder가 없습니다."))
                elif vulnerable_count == 0:
                    results.append(self.get_result(
                        'PASS', 'N/A',
                        f"총 {total_resources}개의 AppStream 리소스를 스캔했으나 과도한 권한을 가진 역할이 없습니다."
                    ))
                    
            except Exception as service_error:
                error_str = str(service_error)
                if any(err in error_str for err in ["AccessDenied", "UnauthorizedOperation", "Forbidden"]):
                    results.append(self.get_result(
                        'PASS', 'appstream-access',
                        "AppStream 서비스 접근이 제한되어 있습니다. (권한 없음)",
                        {'error_type': 'access_denied'}
                    ))
                else:
                    results.append(self.get_result(
                        'ERROR', 'appstream-access',
                        f"AppStream 서비스 조회 중 오류: {error_str}",
                        {'error': error_str}
                    ))
                
                raw.append({'type': 'service_error', 'error': error_str})
                
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', f"AppStream 점검 중 오류: {str(e)}"))
            raw.append({'type': 'error', 'message': str(e)})

        return {'results': results, 'raw': raw, 'guideline_id': 51}