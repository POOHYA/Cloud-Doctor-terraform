from .base_check import BaseCheck
from typing import List, Dict
import ipaddress

class EC2IMDSv2Check(BaseCheck):
    async def check(self) -> List[Dict]:
        ec2 = self.session.client('ec2')
        results = []
        raw = []
        
        try:
            instances = ec2.describe_instances()
            
            if not instances['Reservations']:
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "EC2 인스턴스가 존재하지 않습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 1}
            
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
                            f"인스턴스 {instance_id}는 IMDSv2가 필수로 설정되어 있습니다.",
                            {
                                'http_tokens': http_tokens,
                                'http_put_response_hop_limit': metadata_options.get('HttpPutResponseHopLimit'),
                                'http_endpoint': metadata_options.get('HttpEndpoint'),
                                'metadata_options_raw': metadata_options
                            }
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
            
            if not instances['Reservations']:
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "EC2 인스턴스가 존재하지 않습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 2}
            
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

class SecurityGroupRemoteAccessCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        ec2 = self.session.client('ec2')
        results = []
        raw = []
        
        try:
            security_groups = ec2.describe_security_groups()
            
            if not security_groups['SecurityGroups']:
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "Security Group이 존재하지 않습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 5}
            
            for sg in security_groups['SecurityGroups']:
                sg_id = sg['GroupId']
                sg_name = sg.get('GroupName', 'N/A')
                inbound_rules = sg.get('IpPermissions', [])
                
                sg_has_violation = False
                violations = []
                
                for rule in inbound_rules: # raw 데이터 수집 전에 미리 raw에 추가하려면 수정 필요
                    from_port = rule.get('FromPort')
                    to_port = rule.get('ToPort')
                    
                    # SSH(22) 또는 RDP(3389) 포트인지 확인
                    if from_port is None or to_port is None:
                        continue
                    
                    is_target_port = (from_port <= 22 <= to_port) or (from_port <= 3389 <= to_port)
                    
                    if not is_target_port:
                        continue
                    
                    # IPv4 CIDR 검사
                    ipv4_ranges = rule.get('IpRanges', [])
                    for cidr_range in ipv4_ranges:
                        cidr = cidr_range.get('CidrIp')
                        description = cidr_range.get('Description', '')
                        
                        try:
                            network = ipaddress.IPv4Network(cidr, strict=False)
                            # /16보다 넓으면 (prefixlen < 16) FAIL
                            if network.prefixlen < 16:
                                sg_has_violation = True
                                violations.append({
                                    'port': f"{from_port}-{to_port}",
                                    'cidr': cidr,
                                    'prefix_len': network.prefixlen,
                                    'description': description
                                })
                        except ValueError:
                            pass
                    
                    # IPv6 CIDR 검사
                    ipv6_ranges = rule.get('Ipv6Ranges', [])
                    for cidr_range in ipv6_ranges:
                        cidr = cidr_range.get('CidrIpv6')
                        description = cidr_range.get('Description', '')
                        
                        try:
                            network = ipaddress.IPv6Network(cidr, strict=False)
                            # /32보다 넓으면 (prefixlen < 32) FAIL
                            if network.prefixlen < 32:
                                sg_has_violation = True
                                violations.append({
                                    'port': f"{from_port}-{to_port}",
                                    'cidr': cidr,
                                    'prefix_len': network.prefixlen,
                                    'description': description
                                })
                        except ValueError:
                            pass
                
                raw.append({
                    'sg_id': sg_id,
                    'sg_name': sg_name,
                    'inbound_rules': inbound_rules,
                    'violations': violations,
                    'sg_data': sg
                })
                
                if sg_has_violation:
                    results.append(self.get_result(
                        'FAIL', sg_id,
                        f"Security Group {sg_name}({sg_id})에 SSH 또는 RDP 포트가 /16보다 넓은 CIDR로 열려있습니다.",
                        {
                            'sg_name': sg_name,
                            'violations': violations
                        }
                    ))
                else:
                    results.append(self.get_result(
                        'PASS', sg_id,
                        f"Security Group {sg_name}({sg_id})는 SSH/RDP 포트가 안전하게 구성되어 있습니다.",
                        {
                            'sg_name': sg_name,
                            'inbound_rules': inbound_rules
                        }
                    ))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 5}
    