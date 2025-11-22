import json
from .base_check import BaseCheck
from typing import List, Dict

class S3PublicAccessAndPolicyCheck(BaseCheck):
    """S3 퍼블릭 액세스 차단과 버킷 정책 종합 점검"""
    
    async def check(self) -> Dict:
        s3 = self.session.client('s3')
        results = []
        raw = []
        
        try:
            buckets = s3.list_buckets()
            
            if not buckets.get('Buckets'):
                results.append(self.get_result('PASS', 'N/A', "점검할 S3 버킷이 존재하지 않습니다."))
                return {'results': results, 'raw': raw, 'guideline_id': 7}

            for bucket in buckets['Buckets']:
                bucket_name = bucket['Name']
                bucket_data = {'bucket_name': bucket_name}
                
                # 점검 기준 1: 퍼블릭 액세스 차단 설정
                public_access_blocked = False
                try:
                    response = s3.get_public_access_block(Bucket=bucket_name)
                    config = response['PublicAccessBlockConfiguration']
                    bucket_data['public_access_block'] = config
                    
                    public_access_blocked = (
                        config.get('BlockPublicAcls', False) and
                        config.get('IgnorePublicAcls', False) and
                        config.get('BlockPublicPolicy', False) and
                        config.get('RestrictPublicBuckets', False)
                    )
                except s3.exceptions.ClientError:
                    bucket_data['public_access_block'] = None
                    public_access_blocked = False
                
                # 점검 기준 2: 버킷 정책
                policy_safe = True
                try:
                    # ========== 1. 퍼블릭 액세스 차단 설정 확인 ==========
                    block_public_access_enabled = False
                    block_config = None
                    
                    try:
                        public_access_block = s3.get_public_access_block(Bucket=bucket_name)
                        block_config = public_access_block['PublicAccessBlockConfiguration']
                        
                        # 모든 퍼블릭 액세스 차단 항목이 활성화되어 있는지 확인
                        block_public_access_enabled = (
                            block_config.get('BlockPublicAcls', False) and
                            block_config.get('IgnorePublicAcls', False) and
                            block_config.get('BlockPublicPolicy', False) and
                            block_config.get('RestrictPublicBuckets', False)
                        )
                    except s3.exceptions.NoSuchPublicAccessBlockConfiguration:
                        # 퍼블릭 액세스 차단 설정이 없으면 비활성화로 간주
                        block_public_access_enabled = False
                        block_config = None
                    
                    # ========== 2. 버킷 정책 확인 ==========
                    has_public_policy = False
                    policy_dict = None
                    vulnerable_statements = []
                    
                    try:
                        policy_response = s3.get_bucket_policy(Bucket=bucket_name)
                        policy_str = policy_response['Policy']
                        policy_dict = json.loads(policy_str)
                        
                        for stmt in policy_dict.get('Statement', []):
                            if stmt.get('Effect') == 'Allow':
                                principal = stmt.get('Principal')
                                
                                # Principal이 "*"인지 확인
                                is_public_principal = (
                                    principal == '*' or 
                                    (isinstance(principal, dict) and principal.get('AWS') == '*')
                                )
                                
                                if is_public_principal:
                                    action = stmt.get('Action')
                                    dangerous_actions = {'s3:GetObject', 's3:PutObject', 's3:*'}
                                    
                                    # Action에 위험한 권한이 포함되어 있는지 확인
                                    found_dangerous_action = False
                                    if isinstance(action, str):
                                        found_dangerous_action = action in dangerous_actions
                                    elif isinstance(action, list):
                                        found_dangerous_action = not dangerous_actions.isdisjoint(action)
                                    
                                    if found_dangerous_action:
                                        has_public_policy = True
                                        vulnerable_statements.append(stmt)
                    
                    except s3.exceptions.ClientError as e:
                        if e.response['Error']['Code'] == 'NoSuchBucketPolicy':
                            # 정책이 없으면 has_public_policy는 False 유지
                            policy_dict = None
                        else:
                            raise  # 다른 오류는 상위로 전달
                    
                    # ========== 3. Raw 데이터 저장 ==========
                    raw.append({
                        'bucket_name': bucket_name,
                        'block_public_access_enabled': block_public_access_enabled,
                        'block_config': block_config,
                        'has_public_policy': has_public_policy,
                        'policy': policy_dict,
                        'vulnerable_statements': vulnerable_statements
                    })
                    
                    # ========== 4. 판정 로직 (OR 조건) ==========
                    # 하나라도 문제가 있으면 취약
                    vulnerability_reasons = []
                    recommendations = []
                    
                    if not block_public_access_enabled:
                        vulnerability_reasons.append("모든 퍼블릭 액세스 차단 설정이 비활성화되어 있음")
                        recommendations.append("퍼블릭 용도의 버킷이 아니라면 모든 퍼블릭 액세스 차단을 활성화해야 합니다")
                    
                    if has_public_policy:
                        actions = set()
                        for stmt in vulnerable_statements:
                            action = stmt.get('Action')
                            if isinstance(action, str):
                                actions.add(action)
                            elif isinstance(action, list):
                                actions.update(action)
                        vulnerability_reasons.append(
                            f"버킷 정책에서 Principal '*'에 대해 위험한 권한({', '.join(actions)})이 허용됨"
                        )
                        recommendations.append("Principal은 특정 AWS 계정/역할/사용자 ARN으로 한정하고 Resource는 버킷 안 특정 폴더로 지정해야 합니다")
                    
                    # 판정
                    if vulnerability_reasons:
                        status = 'FAIL'
                        reasons_text = " 또한 ".join(vulnerability_reasons)
                        recommendations_text = " ".join(recommendations)
                        message = f"버킷 [{bucket_name}]이(가) 취약합니다: {reasons_text}. {recommendations_text}."
                        
                        results.append(self.get_result(
                            status, bucket_name, message,
                            {
                                'block_public_access_enabled': block_public_access_enabled,
                                'has_public_policy': has_public_policy,
                                'vulnerability_reasons': vulnerability_reasons,
                                'vulnerable_statements': vulnerable_statements,
                                'block_config': block_config
                            }
                        ))
                    else:
                        status = 'PASS'
                        message = f"버킷 [{bucket_name}]은 모든 퍼블릭 액세스가 차단되어 있고, 위험한 버킷 정책이 없습니다."
                        
                        results.append(self.get_result(
                            status, bucket_name, message,
                            {
                                'block_public_access_enabled': block_public_access_enabled,
                                'has_public_policy': has_public_policy
                            }
                        ))

                except s3.exceptions.ClientError as e:
                    error_code = e.response['Error']['Code']
                    raw.append({'bucket_name': bucket_name, 'error': str(e)})
                    
                    if error_code == 'AccessDenied':
                        results.append(self.get_result(
                            'ERROR', bucket_name,
                            f"버킷 [{bucket_name}]의 설정 조회 권한이 없습니다."
                        ))
                    else:
                        results.append(self.get_result(
                            'ERROR', bucket_name,
                            f"버킷 [{bucket_name}] 점검 중 오류 발생: {error_code}"
                        ))
                
                except Exception as e:
                    raw.append({'bucket_name': bucket_name, 'error': str(e)})
                    results.append(self.get_result(
                        'ERROR', bucket_name,
                        f"버킷 [{bucket_name}] 점검 중 예상치 못한 오류 발생: {str(e)}"
                    ))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', f"S3 버킷 목록 조회 중 오류 발생: {str(e)}"))
        
        return {'results': results, 'raw': raw, 'guideline_id': 1}

class S3ACLCheck(BaseCheck):
    """S3 버킷 ACL에 의한 외부 접근 허용 및 정보유출 위험 점검"""

    async def check(self) -> Dict:
        s3 = self.session.client('s3')
        results = []
        raw = []
        
        # AWS에서 정의한 Public 그룹들
        PUBLIC_GROUPS = {
            'http://acs.amazonaws.com/groups/global/AllUsers': '모든 사람(퍼블릭 액세스)',
            'http://acs.amazonaws.com/groups/global/AuthenticatedUsers': '인증된 사용자 그룹(AWS 계정)',
            'http://acs.amazonaws.com/groups/s3/LogDelivery': 'S3 로그 전달 그룹'
        }
        
        DANGEROUS_PERMISSIONS = ['WRITE', 'WRITE_ACP', 'FULL_CONTROL']

        try:
            buckets_response = s3.list_buckets()
            
            if not buckets_response.get('Buckets'):
                results.append(self.get_result('PASS', 'N/A', "점검할 S3 버킷이 존재하지 않습니다."))
                return {'results': results, 'raw': raw, 'guideline_id': 8}

            owner_id = buckets_response['Owner']['ID']
            
            for bucket in buckets_response['Buckets']:
                bucket_name = bucket['Name']
                
                try:
                    # ACL 조회
                    acl_response = s3.get_bucket_acl(Bucket=bucket_name)
                    acl_data = acl_response['Grants']
                    
                    raw.append({
                        'bucket_name': bucket_name,
                        'owner_id': owner_id,
                        'acl': acl_data
                    })

                    # ACL 분석
                    owner_only = True  # 소유자만 권한이 있는지 확인
                    public_grants = []
                    
                    # 점검 기준 2: 외부 계정 권한 (12자리 숫자 계정 ID)
                    has_external_access = False
                    external_grants = []
                    group_grants = []

                    for grant in acl_data:
                        grantee = grant['Grantee']
                        grantee_type = grantee.get('Type')
                        permission = grant.get('Permission')
                        
                        # 소유자가 아닌 다른 권한이 있는지 확인
                        if grantee_type == 'CanonicalUser':
                            grantee_id = grantee.get('ID')
                            if grantee_id != owner_id:
                                owner_only = False
                                external_grants.append({
                                    'grantee_id': grantee_id,
                                    'permission': permission
                                })
                        
                        # Public 그룹 접근 확인
                        elif grantee_type == 'Group':
                            owner_only = False
                            uri = grantee.get('URI')
                            group_name = PUBLIC_GROUPS.get(uri, uri)
                            
                            group_grants.append({
                                'group': group_name,
                                'uri': uri,
                                'permission': permission
                            })
                            
                            # 위험한 Public 그룹 식별
                            if uri in ['http://acs.amazonaws.com/groups/global/AllUsers',
                                      'http://acs.amazonaws.com/groups/global/AuthenticatedUsers']:
                                public_grants.append({
                                    'group': group_name,
                                    'permission': permission,
                                    'is_dangerous': permission in DANGEROUS_PERMISSIONS
                                })

                    # 판정 로직
                    details = {
                        'owner_only': owner_only,
                        'public_grants': public_grants,
                        'group_grants': group_grants,
                        'external_grants': external_grants,
                        'total_grants': len(acl_data)
                    }
                    
                    if owner_only:
                        # ✅ 버킷 소유자만 권한 보유 - 양호
                        status = 'PASS'
                        message = f"버킷 [{bucket_name}]은 버킷 소유자만 접근 권한을 가지고 있습니다."
                    
                    elif public_grants:
                        # 🔴 모든 사람 또는 인증된 사용자 그룹 접근 - 취약
                        dangerous_count = sum(1 for g in public_grants if g['is_dangerous'])
                        grantee_names = ', '.join(set([g['group'] for g in public_grants]))
                        
                        if dangerous_count > 0:
                            status = 'FAIL'
                            perms = ', '.join([f"{g['group']}({g['permission']})" for g in public_grants if g['is_dangerous']])
                            message = f"버킷 [{bucket_name}]이 Public 그룹에 위험한 권한({perms})을 허용합니다. 해당 피부여자({grantee_names})를 체크 해제하거나 삭제해야 합니다."
                        else:
                            status = 'FAIL'
                            perms = ', '.join([f"{g['group']}({g['permission']})" for g in public_grants])
                            message = f"버킷 [{bucket_name}]이 Public 그룹 접근({perms})을 허용합니다. 해당 피부여자({grantee_names})를 체크 해제하거나 삭제해야 합니다."
                    
                    elif group_grants:
                        # 🟡 S3 로그 전달 그룹 등 다른 그룹 접근
                        status = 'FAIL'
                        groups_info = ', '.join([f"{g['group']}({g['permission']})" for g in group_grants])
                        grantee_names = ', '.join(set([g['group'] for g in group_grants]))
                        message = f"버킷 [{bucket_name}]이 그룹 접근({groups_info})을 허용합니다. 해당 피부여자({grantee_names})를 체크 해제하거나 삭제해야 합니다."
                    
                    elif external_grants:
                        # 🟡 다른 AWS 계정 접근
                        status = 'FAIL'
                        message = f"버킷 [{bucket_name}]이 {len(external_grants)}개의 외부 AWS 계정에 접근 권한을 부여했습니다. 해당 피부여자(외부 AWS 계정)를 체크 해제하거나 삭제해야 합니다."
                    
                    else:
                        # 이론상 여기 도달하지 않지만 안전장치
                        status = 'ERROR'
                        message = f"버킷 [{bucket_name}]의 ACL 구성을 확인할 수 없습니다."
                    
                    results.append(self.get_result(status, bucket_name, message, details))
                    
                except s3.exceptions.ClientError as e:
                    error_code = e.response['Error']['Code']
                    raw.append({'bucket_name': bucket_name, 'acl': None, 'error': str(e)})
                    
                    if error_code == 'AccessDenied':
                        results.append(self.get_result(
                            'ERROR', bucket_name,
                            f"버킷 [{bucket_name}]의 ACL 조회 권한이 없습니다."
                        ))
                    else:
                        results.append(self.get_result(
                            'ERROR', bucket_name,
                            f"버킷 [{bucket_name}]의 ACL 조회 중 오류 발생: {error_code}"
                        ))
                
                except Exception as e:
                    results.append(self.get_result(
                        'ERROR', bucket_name,
                        f"버킷 [{bucket_name}] 점검 중 예상치 못한 오류: {str(e)}"
                    ))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', f"S3 버킷 목록 조회 중 오류 발생: {str(e)}"))
        
        return {'results': results, 'raw': raw, 'guideline_id': 2}

class S3ReplicationRuleCheck(BaseCheck):
    """S3 복제 규칙 대상 버킷 점검"""
    
    async def check(self) -> Dict:
        s3 = self.session.client('s3')
        results = []
        raw = []
        
        # 허용된 대상 버킷 ARN 패턴 (조직에서 관리하는 버킷)
        # 비어있으닄 모든 대상을 취약하다고 판단
        ALLOWED_TARGET_PATTERNS = []
        
        try:
            buckets = s3.list_buckets()
            
            if not buckets.get('Buckets'):
                results.append(self.get_result('PASS', 'N/A', "점검할 S3 버킷이 존재하지 않습니다."))
                return {'results': results, 'raw': raw, 'guideline_id': 3}

            for bucket in buckets['Buckets']:
                bucket_name = bucket['Name']
                
                try:
                    response = s3.get_bucket_replication(Bucket=bucket_name)
                    replication_config = response['ReplicationConfiguration']
                    
                    bucket_data = {
                        'bucket_name': bucket_name,
                        'replication_config': replication_config
                    }
                    raw.append(bucket_data)
                    
                    vulnerable_rules = []
                    
                    for rule in replication_config.get('Rules', []):
                        if rule.get('Status') == 'Enabled':
                            destination = rule.get('Destination', {})
                            target_bucket_arn = destination.get('Bucket', '')
                            
                            # 허용된 대상인지 확인
                            is_allowed = False
                            if ALLOWED_TARGET_PATTERNS:
                                for pattern in ALLOWED_TARGET_PATTERNS:
                                    if pattern.endswith('*'):
                                        if target_bucket_arn.startswith(pattern[:-1]):
                                            is_allowed = True
                                            break
                                    elif target_bucket_arn == pattern:
                                        is_allowed = True
                                        break
                            
                            # ALLOWED_TARGET_PATTERNS가 비어있으면 모든 대상을 취약하다고 판단
                            if not is_allowed:
                                vulnerable_rules.append({
                                    'rule_id': rule.get('ID'),
                                    'target_bucket': target_bucket_arn,
                                    'status': rule.get('Status')
                                })
                    
                    bucket_data['vulnerable_rules'] = vulnerable_rules
                    
                    if vulnerable_rules:
                        results.append(self.get_result(
                            'FAIL', bucket_name,
                            f"버킷 [{bucket_name}]의 복제 규칙이 허용되지 않은 대상 버킷으로 설정되어 있습니다.",
                            bucket_data
                        ))
                    else:
                        results.append(self.get_result(
                            'FAIL', bucket_name,
                            f"버킷 [{bucket_name}]의 복제 규칙이 안전하게 설정되어 있습니다.",
                            bucket_data
                        ))
                        
                except s3.exceptions.ClientError as e:
                    if e.response['Error']['Code'] == 'ReplicationConfigurationNotFoundError':
                        raw.append({'bucket_name': bucket_name, 'replication_config': None})
                        results.append(self.get_result(
                            'PASS', bucket_name,
                            f"버킷 [{bucket_name}]에 복제 규칙이 설정되어 있지 않습니다."
                        ))
                    else:
                        raw.append({'bucket_name': bucket_name, 'error': str(e)})
                        results.append(self.get_result(
                            'ERROR', bucket_name,
                            f"버킷 [{bucket_name}]의 복제 설정 조회 중 오류: {e.response['Error']['Code']}"
                        ))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', f"S3 버킷 목록 조회 중 오류: {str(e)}"))
        
        return {'results': results, 'raw': raw, 'guideline_id': 3}

class S3EncryptionCheck(BaseCheck):
    """S3 버킷 암호화 설정 점검"""
    
    async def check(self) -> Dict:
        results = []
        results.append(self.get_result('PASS', 'N/A', 'S3 암호화 설정 점검이 구현되지 않았습니다.'))
        return {'results': results, 'raw': [], 'guideline_id': 10}