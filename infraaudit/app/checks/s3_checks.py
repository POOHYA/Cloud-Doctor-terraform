import json
from .base_check import BaseCheck
from typing import List, Dict

class S3BucketPolicyPublicActionsCheck(BaseCheck):
    """S3 버킷 정책의 공개 설정과 Get/Put 권한으로 인한 데이터 탈취/악성코드 주입 위협"""
    
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
                
                try:
                    policy_response = s3.get_bucket_policy(Bucket=bucket_name)
                    policy_str = policy_response['Policy']
                    policy_dict = json.loads(policy_str)
                    
                    raw.append({'bucket_name': bucket_name, 'policy': policy_dict})

                    is_vulnerable = False
                    vulnerable_statements = []
                    
                    for stmt in policy_dict.get('Statement', []):
                        if stmt.get('Effect') == 'Allow':
                            principal = stmt.get('Principal')
                            is_public_principal = (principal == '*' or 
                                                 (isinstance(principal, dict) and principal.get('AWS') == '*'))
                            
                            if is_public_principal:
                                action = stmt.get('Action')
                                dangerous_actions = {'s3:GetObject', 's3:PutObject', 's3:*'}
                                
                                if isinstance(action, str):
                                    found_dangerous_action = action in dangerous_actions
                                elif isinstance(action, list):
                                    found_dangerous_action = not dangerous_actions.isdisjoint(action)
                                else:
                                    found_dangerous_action = False
                                
                                if found_dangerous_action:
                                    is_vulnerable = True
                                    vulnerable_statements.append(stmt)

                    if is_vulnerable:
                        results.append(self.get_result(
                            'FAIL', bucket_name,
                            f"버킷 [{bucket_name}] 정책에 Principal '*'에 대해 s3:GetObject 또는 s3:PutObject 권한이 허용되어 있습니다.",
                            {'vulnerable_statements': vulnerable_statements, 'policy': policy_dict}
                        ))
                    else:
                        results.append(self.get_result(
                            'PASS', bucket_name,
                            f"버킷 [{bucket_name}] 정책에 Public GetObject/PutObject 권한이 없습니다.",
                            {'policy': policy_dict}
                        ))

                except s3.exceptions.ClientError as e:
                    if e.response['Error']['Code'] == 'NoSuchBucketPolicy':
                        raw.append({'bucket_name': bucket_name, 'policy': None, 'error': 'NoSuchBucketPolicy'})
                        results.append(self.get_result('PASS', bucket_name, f"버킷 [{bucket_name}]에는 정책이 설정되어 있지 않습니다."))
                    else:
                        raw.append({'bucket_name': bucket_name, 'policy': None, 'error': str(e)})
                        results.append(self.get_result('ERROR', bucket_name, f"버킷 [{bucket_name}]의 정책을 조회하는 중 오류 발생: {e.response['Error']['Code']}"))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', f"S3 버킷 목록 조회 중 오류 발생: {str(e)}"))
        
        return {'results': results, 'raw': raw, 'guideline_id': 7}

class S3BucketACLCheck(BaseCheck):
    """S3 객체/버킷 ACL에 의한 외부 접근 허용 및 정보유출 위험"""

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
                return {'results': results, 'raw': raw, 'guideline_id': 8}

            owner_id = buckets_response['Owner']['ID']
            
            for bucket in buckets_response['Buckets']:
                bucket_name = bucket['Name']
                
                try:
                    acl_response = s3.get_bucket_acl(Bucket=bucket_name)
                    acl_data = acl_response['Grants']
                    
                    raw.append({'bucket_name': bucket_name, 'owner_id': owner_id, 'acl': acl_data})

                    has_public_group_access = False
                    has_external_account_access = False
                    public_grants = []
                    external_grants = []

                    for grant in acl_data:
                        grantee = grant['Grantee']
                        grantee_type = grantee.get('Type')
                        
                        if grantee_type == 'Group' and grantee.get('URI') in PUBLIC_GROUPS:
                            has_public_group_access = True
                            public_grants.append(grant)
                        
                        if grantee_type == 'CanonicalUser' and grantee.get('ID') != owner_id:
                            has_external_account_access = True
                            external_grants.append(grant)

                    details = {
                        'public_grants_found': public_grants,
                        'external_grants_found': external_grants,
                        'full_acl': acl_data
                    }
                    
                    if has_public_group_access and has_external_account_access:
                        status = 'FAIL'
                        message = f"버킷 [{bucket_name}]이 Public 그룹 접근과 외부 계정 접근을 모두 허용합니다."
                    elif has_public_group_access:
                        status = 'WARN'
                        message = f"버킷 [{bucket_name}]이 Public 그룹 접근을 허용합니다."
                    elif has_external_account_access:
                        status = 'WARN'
                        message = f"버킷 [{bucket_name}]이 알 수 없는 외부 AWS 계정 접근을 허용합니다."
                    else:
                        status = 'PASS'
                        message = f"버킷 [{bucket_name}]에 Public 그룹 접근이나 외부 계정 접근이 없습니다."
                    
                    results.append(self.get_result(status, bucket_name, message, details))

                except s3.exceptions.ClientError as e:
                    raw.append({'bucket_name': bucket_name, 'acl': None, 'error': str(e)})
                    results.append(self.get_result('ERROR', bucket_name, f"버킷 [{bucket_name}]의 ACL을 조회하는 중 오류 발생: {e.response['Error']['Code']}"))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', f"S3 버킷 목록 조회 중 오류 발생: {str(e)}"))
        
        return {'results': results, 'raw': raw, 'guideline_id': 8}

class S3ReplicationRoleCheck(BaseCheck):
    """S3 복제 규칙 IAM 역할 점검"""
    
    async def check(self) -> Dict:
        results = []
        results.append(self.get_result('PASS', 'N/A', 'S3 복제 규칙 점검이 구현되지 않았습니다.'))
        return {'results': results, 'raw': [], 'guideline_id': 9}

class S3EncryptionCheck(BaseCheck):
    """S3 버킷 암호화 설정 점검"""
    
    async def check(self) -> Dict:
        results = []
        results.append(self.get_result('PASS', 'N/A', 'S3 암호화 설정 점검이 구현되지 않았습니다.'))
        return {'results': results, 'raw': [], 'guideline_id': 10}

# 기존 클래스들과의 호환성을 위한 별칭
S3BucketPolicyCheck = S3BucketPolicyPublicActionsCheck
S3PublicAccessCheck = S3BucketACLCheck