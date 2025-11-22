from typing import List, Dict
from .base_check import BaseCheck

class KMSImportedKeyMaterialCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        kms = self.session.client('kms')
        results = []
        raw = []
        
        try:
            # 모든 고객 관리형 키 조회
            keys_response = kms.list_keys()
            keys = keys_response.get('Keys', [])
            
            if not keys:
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "KMS 고객 관리형 키가 존재하지 않습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': None}
            
            for key in keys:
                key_id = key['KeyId']
                
                try:
                    # 키 메타데이터 조회
                    key_metadata = kms.describe_key(KeyId=key_id)['KeyMetadata']
                    
                    # AWS 관리형 키는 제외
                    if key_metadata.get('KeyManager') == 'AWS':
                        continue
                    
                    key_arn = key_metadata['Arn']
                    key_origin = key_metadata.get('Origin', 'AWS_KMS')
                    
                    # 키 정책 조회
                    try:
                        key_policy_response = kms.get_key_policy(
                            KeyId=key_id,
                            PolicyName='default'
                        )
                        key_policy = key_policy_response.get('Policy', '{}')
                    except Exception:
                        key_policy = '{}'
                    
                    raw.append({
                        'key_id': key_id,
                        'key_arn': key_arn,
                        'key_origin': key_origin,
                        'key_metadata': key_metadata,
                        'key_policy': key_policy
                    })
                    
                    # 외부 키 구성 원본 확인
                    if key_origin == 'EXTERNAL':
                        # 키 정책에서 ImportKeyMaterial/DeleteImportedKeyMaterial 권한 확인
                        has_import_permission = 'kms:ImportKeyMaterial' in key_policy
                        has_delete_permission = 'kms:DeleteImportedKeyMaterial' in key_policy
                        has_wildcard_principal = '"Principal":"*"' in key_policy or '"Principal":{"AWS":"*"}' in key_policy
                        
                        is_vulnerable = (has_import_permission or has_delete_permission) and has_wildcard_principal
                        
                        if is_vulnerable:
                            results.append(self.get_result(
                                'FAIL', key_id,
                                f"CMK {key_id}의 키 구성 원본이 외부로 설정되어 있고 kms:ImportKeyMaterial/kms:DeleteImportedKeyMaterial 권한이 광범위하게 허용되어 있습니다.",
                                {
                                    'key_arn': key_arn,
                                    'key_origin': key_origin,
                                    'has_import_permission': has_import_permission,
                                    'has_delete_permission': has_delete_permission,
                                    'has_wildcard_principal': has_wildcard_principal
                                }
                            ))
                        else:
                            results.append(self.get_result(
                                'WARN', key_id,
                                f"CMK {key_id}의 키 구성 원본이 외부로 설정되어 있습니다. 권한 통제를 확인하세요.",
                                {
                                    'key_arn': key_arn,
                                    'key_origin': key_origin,
                                    'has_import_permission': has_import_permission,
                                    'has_delete_permission': has_delete_permission
                                }
                            ))
                    else:
                        results.append(self.get_result(
                            'PASS', key_id,
                            f"CMK {key_id}는 AWS KMS에서 생성된 키 구성 원본을 사용합니다.",
                            {
                                'key_arn': key_arn,
                                'key_origin': key_origin
                            }
                        ))
                
                except Exception as e:
                    results.append(self.get_result(
                        'ERROR', key_id,
                        f"키 {key_id} 점검 중 오류 발생: {str(e)}"
                    ))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 28}
