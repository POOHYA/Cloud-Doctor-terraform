from .base_check import BaseCheck
from typing import List, Dict

class RedshiftEncryptionCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        redshift = self.session.client('redshift')
        results = []
        raw = []
        
        try:
            clusters = redshift.describe_clusters()
            
            if not clusters.get('Clusters'):
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "Redshift 클러스터가 없습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 55}
            
            for cluster in clusters['Clusters']:
                cluster_id = cluster.get('ClusterIdentifier')
                encrypted = cluster.get('Encrypted', False)
                
                raw.append({
                    'cluster_id': cluster_id,
                    'encrypted': encrypted,
                    'kms_key_id': cluster.get('KmsKeyId'),
                    'cluster_data': cluster
                })
                
                if encrypted:
                    results.append(self.get_result(
                        'PASS', cluster_id,
                        f"Redshift 클러스터 {cluster_id}는 암호화가 활성화되어 있습니다.",
                        {
                            'cluster_id': cluster_id,
                            'encrypted': True,
                            'kms_key_id': cluster.get('KmsKeyId')
                        }
                    ))
                else:
                    results.append(self.get_result(
                        'FAIL', cluster_id,
                        f"Redshift 클러스터 {cluster_id}의 암호화가 비활성화되어 있습니다. | 암호화를 활성화하세요.",
                        {
                            'cluster_id': cluster_id,
                            'encrypted': False
                        }
                    ))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 55}