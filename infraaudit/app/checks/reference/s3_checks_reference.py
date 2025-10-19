from .base_check import BaseCheck
from typing import List, Dict

class S3PublicAccessCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        s3 = self.session.client('s3')
        results = []
        
        try:
            buckets = s3.list_buckets()['Buckets']
            
            for bucket in buckets:
                bucket_name = bucket['Name']
                
                try:
                    block_config = s3.get_public_access_block(Bucket=bucket_name)['PublicAccessBlockConfiguration']
                    
                    if not all([
                        block_config.get('BlockPublicAcls', False),
                        block_config.get('IgnorePublicAcls', False),
                        block_config.get('BlockPublicPolicy', False),
                        block_config.get('RestrictPublicBuckets', False)
                    ]):
                        results.append(self.get_result(
                            'FAIL', bucket_name,
                            f"Bucket {bucket_name} public access not fully blocked",
                            block_config
                        ))
                    else:
                        results.append(self.get_result(
                            'PASS', bucket_name,
                            f"Bucket {bucket_name} public access blocked"
                        ))
                except s3.exceptions.NoSuchPublicAccessBlockConfiguration:
                    results.append(self.get_result(
                        'FAIL', bucket_name,
                        f"Bucket {bucket_name} has no public access block config"
                    ))
                except Exception as e:
                    results.append(self.get_result('ERROR', bucket_name, str(e)))
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return results

class S3EncryptionCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        s3 = self.session.client('s3')
        results = []
        
        try:
            buckets = s3.list_buckets()['Buckets']
            
            for bucket in buckets:
                bucket_name = bucket['Name']
                
                try:
                    s3.get_bucket_encryption(Bucket=bucket_name)
                    results.append(self.get_result(
                        'PASS', bucket_name,
                        f"Bucket {bucket_name} has encryption enabled"
                    ))
                except s3.exceptions.ServerSideEncryptionConfigurationNotFoundError:
                    results.append(self.get_result(
                        'FAIL', bucket_name,
                        f"Bucket {bucket_name} encryption not enabled"
                    ))
                except Exception as e:
                    results.append(self.get_result('ERROR', bucket_name, str(e)))
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return results
