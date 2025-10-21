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
                return {'results': results, 'raw': raw, 'guideline_id': 1}

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
                    policy_response = s3.get_bucket_policy(Bucket=bucket_name)
                    policy_dict = json.loads(policy_response['Policy'])
                    bucket_data['policy'] = policy_dict
                    
                    for stmt in policy_dict.get('Statement', []):
                        if stmt.get('Effect') == 'Allow':
                            principal = stmt.get('Principal')
                            is_public = (principal == '*' or 
                                       (isinstance(principal, dict) and principal.get('AWS') == '*'))
                            
                            if is_public:
                                actions = stmt.get('Action', [])
                                if isinstance(actions, str):
                                    actions = [actions]
                                
                                dangerous_actions = ['s3:GetObject', 's3:PutObject', 's3:*']
                                if any(action in dangerous_actions for action in actions):
                                    policy_safe = False
                                    break
                                    
                except s3.exceptions.ClientError as e:
                    if e.response['Error']['Code'] == 'NoSuchBucketPolicy':
                        bucket_data['policy'] = None
                        policy_safe = True
                    else:
                        bucket_data['error'] = str(e)
                        results.append(self.get_result(
                            'ERROR', bucket_name,
                            f"버킷 [{bucket_name}] 정책 조회 중 오류: {e.response['Error']['Code']}"
                        ))
                        continue
                
                raw.append(bucket_data)
                
                # XOR 로직: 둘 다 안전하면 양호, 둘 다 위험하면 취약, 하나만 위험하면 경고
                if public_access_blocked and policy_safe:
                    status = 'PASS'
                    message = f"버킷 [{bucket_name}]의 퍼블릭 액세스가 안전하게 차단되어 있습니다."
                elif not public_access_blocked and not policy_safe:
                    status = 'FAIL'
                    message = f"버킷 [{bucket_name}]의 퍼블릭 액세스 차단과 정책 모두 취약합니다."
                else:
                    status = 'WARN'
                    if public_access_blocked:
                        message = f"버킷 [{bucket_name}]의 정책에 위험한 퍼블릭 권한이 있지만 퍼블릭 액세스는 차단되어 있습니다."
                    else:
                        message = f"버킷 [{bucket_name}]의 퍼블릭 액세스 차단이 비활성화되어 있지만 정책은 안전합니다."
                
                results.append(self.get_result(status, bucket_name, message, bucket_data))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', f"S3 버킷 목록 조회 중 오류: {str(e)}"))
        
        return {'results': results, 'raw': raw, 'guideline_id': 1}

class S3ACLCheck(BaseCheck):
    """S3 ACL 설정 점검"""
    
    async def check(self) -> Dict:
        s3 = self.session.client('s3')
        results = []
        raw = []
        
        PUBLIC_GROUPS = [
            'http://acs.amazonaws.com/groups/global/AllUsers',
            'http://acs.amazonaws.com/groups/global/AuthenticatedUsers'
        ]
        
        try:
            buckets_response = s3.list_buckets()
            
            if not buckets_response.get('Buckets'):
                results.append(self.get_result('PASS', 'N/A', "점검할 S3 버킷이 존재하지 않습니다."))
                return {'results': results, 'raw': raw, 'guideline_id': 2}

            owner_id = buckets_response['Owner']['ID']
            
            for bucket in buckets_response['Buckets']:
                bucket_name = bucket['Name']
                
                try:
                    acl_response = s3.get_bucket_acl(Bucket=bucket_name)
                    acl_data = acl_response['Grants']
                    
                    bucket_data = {
                        'bucket_name': bucket_name,
                        'owner_id': owner_id,
                        'acl': acl_data
                    }
                    raw.append(bucket_data)
                    
                    # 점검 기준 1: Public 그룹 권한
                    has_public_access = False
                    public_grants = []
                    
                    # 점검 기준 2: 외부 계정 권한 (12자리 숫자 계정 ID)
                    has_external_access = False
                    external_grants = []
                    
                    for grant in acl_data:
                        grantee = grant['Grantee']
                        grantee_type = grantee.get('Type')
                        
                        # Public 그룹 확인
                        if grantee_type == 'Group' and grantee.get('URI') in PUBLIC_GROUPS:
                            has_public_access = True
                            public_grants.append(grant)
                        
                        # 외부 계정 확인
                        if grantee_type == 'CanonicalUser' and grantee.get('ID') != owner_id:
                            has_external_access = True
                            external_grants.append(grant)
                    
                    bucket_data['public_grants'] = public_grants
                    bucket_data['external_grants'] = external_grants
                    
                    # XOR 로직 적용
                    if not has_public_access and not has_external_access:
                        status = 'PASS'
                        message = f"버킷 [{bucket_name}]의 ACL에 위험한 권한이 없습니다."
                    elif has_public_access and has_external_access:
                        status = 'FAIL'
                        message = f"버킷 [{bucket_name}]의 ACL에 Public 그룹과 외부 계정 권한이 모두 있습니다."
                    else:
                        status = 'WARN'
                        if has_public_access:
                            message = f"버킷 [{bucket_name}]의 ACL에 Public 그룹 권한이 있습니다."
                        else:
                            message = f"버킷 [{bucket_name}]의 ACL에 외부 계정 권한이 있습니다."
                    
                    results.append(self.get_result(status, bucket_name, message, bucket_data))
                    
                except s3.exceptions.ClientError as e:
                    raw.append({'bucket_name': bucket_name, 'error': str(e)})
                    results.append(self.get_result(
                        'ERROR', bucket_name,
                        f"버킷 [{bucket_name}]의 ACL 조회 중 오류: {e.response['Error']['Code']}"
                    ))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', f"S3 버킷 목록 조회 중 오류: {str(e)}"))
        
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
                            'PASS', bucket_name,
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

# 기존 클래스들과의 호환성을 위한 별칭
S3BucketPolicyPublicActionsCheck = S3PublicAccessAndPolicyCheck
S3BucketPolicyCheck = S3PublicAccessAndPolicyCheck
S3PublicAccessCheck = S3ACLCheck
S3BucketACLCheck = S3ACLCheck
