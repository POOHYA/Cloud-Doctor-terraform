from .base_check import BaseCheck
from datetime import datetime
from typing import List, Dict

class RDSPublicAccessibilityCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        rds = self.session.client('rds')
        ec2 = self.session.client('ec2')
        results = []
        raw = []
        
        try:
            db_instances = rds.describe_db_instances()['DBInstances']
            
            if not db_instances:
                return {'results': results, 'raw': raw, 'guideline_id': 24}
            
            for db_instance in db_instances:
                db_identifier = db_instance['DBInstanceIdentifier']
                publicly_accessible = db_instance.get('PubliclyAccessible', False)
                db_subnet_group_name = db_instance.get('DBSubnetGroup', {}).get('DBSubnetGroupName')
                vpc_security_groups = db_instance.get('VpcSecurityGroups', [])
                db_port = db_instance.get('DbInstancePort', 3306)
                
                raw.append({
                    'db_identifier': db_identifier,
                    'publicly_accessible': publicly_accessible,
                    'db_subnet_group_name': db_subnet_group_name,
                    'vpc_security_groups': vpc_security_groups,
                    'db_port': db_port,
                    'db_instance_data': db_instance
                })
                
                has_public_risk = False
                risk_details = {
                    'publicly_accessible': publicly_accessible,
                    'all_subnets_public': False,
                    'wide_cidr_inbound': False,
                    'db_port': db_port
                }
                
                # Public accessibility 체크
                if publicly_accessible:
                    has_public_risk = True
                    
                    # DB 서브넷 그룹의 서브넷들이 모두 퍼블릭인지 확인
                    if db_subnet_group_name:
                        try:
                            subnet_group = rds.describe_db_subnet_groups(
                                DBSubnetGroupName=db_subnet_group_name
                            )['DBSubnetGroups'][0]
                            
                            subnets = subnet_group['Subnets']
                            all_public = True
                            
                            for subnet in subnets:
                                subnet_id = subnet['SubnetIdentifier']
                                subnet_info = ec2.describe_subnets(SubnetIds=[subnet_id])['Subnets'][0]
                                
                                # 퍼블릭 서브넷 여부 확인 (인터넷 게이트웨이로의 라우트 존재)
                                route_tables = ec2.describe_route_tables(
                                    Filters=[
                                        {'Name': 'association.subnet-id', 'Values': [subnet_id]}
                                    ]
                                )['RouteTables']
                                
                                if not route_tables:
                                    # 메인 라우트 테이블 확인
                                    vpc_id = subnet_info['VpcId']
                                    route_tables = ec2.describe_route_tables(
                                        Filters=[
                                            {'Name': 'vpc-id', 'Values': [vpc_id]},
                                            {'Name': 'association.main', 'Values': ['true']}
                                        ]
                                    )['RouteTables']
                                
                                is_public = False
                                for rt in route_tables:
                                    for route in rt['Routes']:
                                        if (route.get('DestinationCidrBlock') == '0.0.0.0/0' and 
                                            'GatewayId' in route and route['GatewayId'].startswith('igw-')):
                                            is_public = True
                                            break
                                
                                if not is_public:
                                    all_public = False
                                    break
                            
                            risk_details['all_subnets_public'] = all_public
                            if all_public:
                                has_public_risk = True
                        except Exception:
                            pass
                    
                    # 보안 그룹 인바운드 규칙에서 넓은 CIDR 범위 확인
                    for sg in vpc_security_groups:
                        sg_id = sg['VpcSecurityGroupId']
                        try:
                            sg_info = ec2.describe_security_groups(GroupIds=[sg_id])['SecurityGroups'][0]
                            
                            for rule in sg_info['IpPermissions']:
                                from_port = rule.get('FromPort')
                                to_port = rule.get('ToPort')
                                
                                # DB 포트가 포함된 규칙인지 확인
                                if (from_port is None or from_port <= db_port) and (to_port is None or to_port >= db_port):
                                    for ip_range in rule.get('IpRanges', []):
                                        cidr = ip_range.get('CidrIp', '')
                                        # 넓은 CIDR 범위 확인 (0.0.0.0/0, /8, /16 등)
                                        if (cidr == '0.0.0.0/0' or 
                                            cidr.endswith('/0') or 
                                            cidr.endswith('/8') or 
                                            cidr.endswith('/16')):
                                            risk_details['wide_cidr_inbound'] = True
                                            has_public_risk = True
                        except Exception:
                            pass
                
                if has_public_risk:
                    results.append(self.get_result(
                        '취약', db_identifier,
                        f"RDS 인스턴스 {db_identifier}가 Public accessibility로 설정되어 있고, 퍼블릭 서브넷 또는 넓은 CIDR 범위의 보안 그룹 규칙이 설정되어 있습니다.",
                        risk_details
                    ))
                else:
                    results.append(self.get_result(
                        '양호', db_identifier,
                        f"RDS 인스턴스 {db_identifier}의 네트워크 접근 설정이 적절히 구성되어 있습니다.",
                        risk_details
                    ))
                        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 24}


class RDSSnapshotPublicAccessCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        rds = self.session.client('rds')
        results = []
        raw = []
        
        try:
            # DB 스냅샷 조회
            db_snapshots = rds.describe_db_snapshots()
            
            manual_db_snapshots = [s for s in db_snapshots['DBSnapshots'] if s.get('SnapshotType') == 'manual']
            
            if not manual_db_snapshots:
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "이 리전에서 관리 중인 RDS 수동 DB 스냅샷이 없습니다."
                ))
            else:
                for snapshot in manual_db_snapshots:
                    snapshot_id = snapshot['DBSnapshotIdentifier']
                    snapshot_type = snapshot.get('SnapshotType', 'N/A')
                    
                    # 스냅샷 속성 조회
                    try:
                        attrs = rds.describe_db_snapshot_attributes(DBSnapshotIdentifier=snapshot_id)
                        restore_attributes = attrs.get('DBSnapshotAttributesResult', {}).get('DBSnapshotAttributes', [])
                        is_public = any(attr.get('AttributeName') == 'restore' and 'all' in attr.get('AttributeValues', []) for attr in restore_attributes)
                    except:
                        is_public = False
                    
                    raw.append({
                        'snapshot_id': snapshot_id,
                        'snapshot_type': snapshot_type,
                        'is_public': is_public,
                        'snapshot_data': snapshot
                    })
                    
                    if is_public:
                        results.append(self.get_result(
                            'FAIL', snapshot_id,
                            f"RDS DB 스냅샷 {snapshot_id}이 공개로 설정되어 있습니다.",
                            {
                                'snapshot_id': snapshot_id,
                                'is_public': is_public,
                                'snapshot_type': snapshot_type
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            'PASS', snapshot_id,
                            f"RDS DB 스냅샷 {snapshot_id}은 프라이빗으로 설정되어 있습니다.",
                            {
                                'snapshot_id': snapshot_id,
                                'is_public': is_public,
                                'snapshot_type': snapshot_type
                            }
                        ))
            
            # DB 클러스터 스냅샷 조회
            cluster_snapshots = rds.describe_db_cluster_snapshots()
            
            manual_cluster_snapshots = [s for s in cluster_snapshots['DBClusterSnapshots'] if s.get('SnapshotType') == 'manual']
            
            if manual_cluster_snapshots:
                for snapshot in manual_cluster_snapshots:
                    snapshot_id = snapshot['DBClusterSnapshotIdentifier']
                    snapshot_type = snapshot.get('SnapshotType', 'N/A')
                    
                    # 클러스터 스냅샷 속성 조회
                    try:
                        attrs = rds.describe_db_cluster_snapshot_attributes(DBClusterSnapshotIdentifier=snapshot_id)
                        restore_attributes = attrs.get('DBClusterSnapshotAttributesResult', {}).get('DBClusterSnapshotAttributes', [])
                        is_public = any(attr.get('AttributeName') == 'restore' and 'all' in attr.get('AttributeValues', []) for attr in restore_attributes)
                    except:
                        is_public = False
                    
                    raw.append({
                        'snapshot_id': snapshot_id,
                        'snapshot_type': snapshot_type,
                        'is_public': is_public,
                        'snapshot_data': snapshot
                    })
                    
                    if is_public:
                        results.append(self.get_result(
                            'FAIL', snapshot_id,
                            f"RDS 클러스터 스냅샷 {snapshot_id}이 공개로 설정되어 있습니다.",
                            {
                                'snapshot_id': snapshot_id,
                                'is_public': is_public,
                                'snapshot_type': snapshot_type
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            'PASS', snapshot_id,
                            f"RDS 클러스터 스냅샷 {snapshot_id}은 프라이빗으로 설정되어 있습니다.",
                            {
                                'snapshot_id': snapshot_id,
                                'is_public': is_public,
                                'snapshot_type': snapshot_type
                            }
                        ))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 27}