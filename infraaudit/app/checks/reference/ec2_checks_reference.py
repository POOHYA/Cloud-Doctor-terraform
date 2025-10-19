from ..base_check import BaseCheck
from typing import List, Dict

class EC2IMDSv2Check(BaseCheck):
    async def check(self) -> List[Dict]:
        ec2 = self.session.client('ec2')
        results = []
        
        try:
            instances = ec2.describe_instances()
            
            for reservation in instances['Reservations']:
                for instance in reservation['Instances']:
                    instance_id = instance['InstanceId']
                    metadata_options = instance.get('MetadataOptions', {})
                    http_tokens = metadata_options.get('HttpTokens', 'optional')
                    
                    if http_tokens != 'required':
                        results.append(self.get_result(
                            'FAIL', instance_id,
                            f"Instance {instance_id} does not enforce IMDSv2",
                            {'http_tokens': http_tokens}
                        ))
                    else:
                        results.append(self.get_result(
                            'PASS', instance_id,
                            f"Instance {instance_id} enforces IMDSv2"
                        ))
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return results

class EC2PublicIPCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        ec2 = self.session.client('ec2')
        results = []
        
        try:
            instances = ec2.describe_instances()
            
            for reservation in instances['Reservations']:
                for instance in reservation['Instances']:
                    instance_id = instance['InstanceId']
                    public_ip = instance.get('PublicIpAddress')
                    
                    if public_ip:
                        results.append(self.get_result(
                            'WARN', instance_id,
                            f"Instance {instance_id} has public IP: {public_ip}",
                            {'public_ip': public_ip}
                        ))
                    else:
                        results.append(self.get_result(
                            'PASS', instance_id,
                            f"Instance {instance_id} has no public IP"
                        ))
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return results
