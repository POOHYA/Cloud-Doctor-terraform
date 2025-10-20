from .base_check import BaseCheck
from typing import List, Dict

class DocumentDBSnapshotPrivateCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        docdb = self.session.client('docdb')
        results = []
        raw = []
        
        try:
            snapshots = docdb.describe_db_cluster_snapshots()
            
            if not snapshots.get('DBClusterSnapshots'):
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "DocumentDB 스냅샷이 없습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 59}
            
            for snapshot in snapshots['DBClusterSnapshots']:
                snapshot_id = snapshot.get('DBClusterSnapshotIdentifier')
                
                try:
                    attrs = docdb.describe_db_cluster_snapshot_attributes(
                        DBClusterSnapshotIdentifier=snapshot_id
                    )
                    
                    attributes = attrs.get('DBClusterSnapshotAttributesResult', {}).get('DBClusterSnapshotAttributes', [])
                    is_public = False
                    
                    for attr in attributes:
                        if attr.get('AttributeName') == 'restore':
                            values = attr.get('AttributeValues', [])
                            if 'all' in values:
                                is_public = True
                                break
                    
                    raw.append({
                        'snapshot_id': snapshot_id,
                        'is_public': is_public,
                        'attributes': attributes,
                        'snapshot_data': snapshot
                    })
                    
                    if is_public:
                        results.append(self.get_result(
                            'FAIL', snapshot_id,
                            f"DocumentDB 스냅샷 {snapshot_id}이 퍼블릭으로 공유되어 있습니다. | 프라이빗으로 설정하세요.",
                            {
                                'snapshot_id': snapshot_id,
                                'is_public': True
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            'PASS', snapshot_id,
                            f"DocumentDB 스냅샷 {snapshot_id}은 프라이빗으로 설정되어 있습니다.",
                            {
                                'snapshot_id': snapshot_id,
                                'is_public': False
                            }
                        ))
                
                except Exception as e:
                    results.append(self.get_result('ERROR', snapshot_id, str(e)))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 59}

class DocumentDBEncryptionCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        docdb = self.session.client('docdb')
        results = []
        raw = []
        
        try:
            clusters = docdb.describe_db_clusters()
            
            if not clusters.get('DBClusters'):
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "DocumentDB 클러스터가 없습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 60}
            
            for cluster in clusters['DBClusters']:
                cluster_id = cluster.get('DBClusterIdentifier')
                encrypted = cluster.get('StorageEncrypted', False)
                kms_key_id = cluster.get('KmsKeyId')
                
                raw.append({
                    'cluster_id': cluster_id,
                    'encrypted': encrypted,
                    'kms_key_id': kms_key_id,
                    'cluster_data': cluster
                })
                
                if encrypted and kms_key_id:
                    results.append(self.get_result(
                        'PASS', cluster_id,
                        f"DocumentDB 클러스터 {cluster_id}는 KMS로 암호화되어 있습니다.",
                        {
                            'cluster_id': cluster_id,
                            'encrypted': True,
                            'kms_key_id': kms_key_id
                        }
                    ))
                else:
                    results.append(self.get_result(
                        'FAIL', cluster_id,
                        f"DocumentDB 클러스터 {cluster_id}가 KMS로 암호화되어 있지 않습니다. | KMS 암호화를 활성화하세요.",
                        {
                            'cluster_id': cluster_id,
                            'encrypted': encrypted,
                            'kms_key_id': kms_key_id
                        }
                    ))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 60}
