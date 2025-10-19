from .base_check import BaseCheck
from typing import List, Dict

class EC2IMDSv2Check(BaseCheck):
    async def check(self) -> List[Dict]:
        ec2 = self.session.client('ec2')
        results = []
        raw = []
        
        try:
            instances = ec2.describe_instances()
            
            for reservation in instances['Reservations']:
                for instance in reservation['Instances']:
                    instance_id = instance['InstanceId']
                    metadata_options = instance.get('MetadataOptions', {})
                    http_tokens = metadata_options.get('HttpTokens', 'optional')
                    
                    raw.append({
                        'instance_id': instance_id,
                        'metadata_options': metadata_options,
                        'instance_data': instance
                    })
                    
                    if http_tokens != 'required':
                        results.append(self.get_result(
                            'FAIL', instance_id,
                            f"인스턴스 {instance_id}는 IMDSv2가 Optional로 설정되어 있습니다.",
                            {
                                'http_tokens': http_tokens,
                                'http_put_response_hop_limit': metadata_options.get('HttpPutResponseHopLimit'),
                                'http_endpoint': metadata_options.get('HttpEndpoint'),
                                'metadata_options_raw': metadata_options
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            'PASS', instance_id,
                            f"인스턴스 {instance_id}는 IMDSv2가 필수로 설정되어 있습니다."
                        ))
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw , 'guideline_id' : 1}

class EC2PublicIPCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        ec2 = self.session.client('ec2')
        results = []
        raw = []
        
        try:
            instances = ec2.describe_instances()
            
            for reservation in instances['Reservations']:
                for instance in reservation['Instances']:
                    instance_id = instance['InstanceId']
                    public_ip = instance.get('PublicIpAddress')
                    
                    raw.append({
                        'instance_id': instance_id,
                        'public_ip': public_ip,
                        'instance_data': instance
                    })
                    
                    if public_ip:
                        results.append(self.get_result(
                            'WARN', instance_id,
                            f"인스턴스 {instance_id}에 공인 IP가 할당되어 있습니다.",
                            {
                                'public_ip': public_ip,
                                'instance_id': instance_id
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            'PASS', instance_id,
                            f"인스턴스 {instance_id}에 공인 IP가 할당되지 않았습니다."
                        ))
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 2}

class EC2AMIPrivateCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        ec2 = self.session.client('ec2')
        results = []
        raw = []
        
        try:
            # 모든 AMI 조회 (소유한 이미지)
            amis = ec2.describe_images(Owners=['self'])
            
            # AMI가 없으면 PASS 반환
            if not amis['Images']:
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "이 리전에서 관리 중인 AMI가 없습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 3}
            
            for ami in amis['Images']:
                ami_id = ami['ImageId']
                ami_name = ami.get('Name', 'N/A')
                
                # LaunchPermission 확인 (public 여부)
                launch_permissions = ami.get('LaunchPermission', [])
                is_public = any(perm.get('Group') == 'all' for perm in launch_permissions)
                
                raw.append({
                    'ami_id': ami_id,
                    'ami_name': ami_name,
                    'is_public': is_public,
                    'launch_permissions': launch_permissions,
                    'ami_data': ami
                })
                
                if is_public:
                    results.append(self.get_result(
                        'FAIL', ami_id,
                        f"AMI {ami_name}이 Public으로 설정되어 있습니다.",
                        {
                            'ami_name': ami_name,
                            'is_public': True,
                            'launch_permissions': launch_permissions
                        }
                    ))
                else:
                    results.append(self.get_result(
                        'PASS', ami_id,
                        f"AMI {ami_name}은 Private으로 설정되어 있습니다.",
                        {
                            'ami_name': ami_name,
                            'is_public': False
                        }
                    ))
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 3}

class EBSSnapshotPrivateCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        ec2 = self.session.client('ec2')
        results = []
        raw = []
        
        try:
            snapshots = ec2.describe_snapshots(OwnerIds=['self'])
            
            if not snapshots['Snapshots']:
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "이 리전에서 관리 중인 EBS 스냅샷이 없습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 4}
            
            for snapshot in snapshots['Snapshots']:
                snapshot_id = snapshot['SnapshotId']
                snapshot_desc = snapshot.get('Description', 'N/A')
                
                attrs = ec2.describe_snapshot_attribute(
                    SnapshotId=snapshot_id,
                    Attribute='createVolumePermission'
                )
                
                create_volume_perms = attrs.get('CreateVolumePermissions', [])
                is_public = any(perm.get('Group') == 'all' for perm in create_volume_perms)
                
                raw.append({
                    'snapshot_id': snapshot_id,
                    'snapshot_description': snapshot_desc,
                    'is_public': is_public,
                    'create_volume_permissions': create_volume_perms,
                    'snapshot_data': snapshot
                })
                
                if is_public:
                    results.append(self.get_result(
                        'FAIL', snapshot_id,
                        f"EBS 스냅샷 {snapshot_id}이 공개로 설정되어 있습니다.",
                        {
                            'snapshot_description': snapshot_desc,
                            'is_public': True,
                            'create_volume_permissions': create_volume_perms
                        }
                    ))
                else:
                    results.append(self.get_result(
                        'PASS', snapshot_id,
                        f"EBS 스냅샷 {snapshot_id}은 프라이빗으로 설정되어 있습니다.",
                        {
                            'snapshot_description': snapshot_desc,
                            'is_public': False
                        }
                    ))
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 6}