import boto3
from botocore.exceptions import ClientError
from typing import Dict

class AWSClientManager:
    def __init__(self):
        self.sts_client = boto3.client('sts')
    
    def assume_role(self, account_id: str, role_name: str, external_id: str = None) -> Dict:
        role_arn = f"arn:aws:iam::{account_id}:role/{role_name}"
        
        assume_role_params = {
            'RoleArn': role_arn,
            'RoleSessionName': 'CloudDoctorAuditSession',
            'DurationSeconds': 3600
        }
        
        if external_id:
            assume_role_params['ExternalId'] = external_id
        
        try:
            response = self.sts_client.assume_role(**assume_role_params)
            credentials = response['Credentials']
            
            return {
                'aws_access_key_id': credentials['AccessKeyId'],
                'aws_secret_access_key': credentials['SecretAccessKey'],
                'aws_session_token': credentials['SessionToken']
            }
        except ClientError as e:
            raise Exception(f"Failed to assume role: {str(e)}")
    
    def get_session(self, credentials: Dict) -> boto3.Session:
        return boto3.Session(
            aws_access_key_id=credentials['aws_access_key_id'],
            aws_secret_access_key=credentials['aws_secret_access_key'],
            aws_session_token=credentials['aws_session_token']
        )
