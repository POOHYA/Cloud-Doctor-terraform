import uuid
from datetime import datetime
from typing import Dict, List
from app.core.aws_client import AWSClientManager
from app.checks.iam_checks import IAMAccessKeyAgeCheck, IAMRootAccessKeyCheck, IAMRootMFACheck
from app.checks.s3_checks import S3PublicAccessCheck, S3EncryptionCheck
from app.checks.ec2_checks import EC2IMDSv2Check, EC2PublicIPCheck

class AuditService:
    def __init__(self):
        self.aws_client_manager = AWSClientManager()
        self.audits: Dict[str, Dict] = {}
        
        self.check_registry = {
            'iam_access_key_age': IAMAccessKeyAgeCheck,
            'iam_root_access_key': IAMRootAccessKeyCheck,
            'iam_root_mfa': IAMRootMFACheck,
            's3_public_access': S3PublicAccessCheck,
            's3_encryption': S3EncryptionCheck,
            'ec2_imdsv2': EC2IMDSv2Check,
            'ec2_public_ip': EC2PublicIPCheck,
        }
    
    async def run_audit(self, account_id: str, role_name: str, checks: List[str] = None, external_id: str = None) -> Dict:
        audit_id = str(uuid.uuid4())
        started_at = datetime.utcnow()
        
        try:
            credentials = self.aws_client_manager.assume_role(account_id, role_name, external_id)
            session = self.aws_client_manager.get_session(credentials)
            
            results = []
            checks_to_run = checks if checks else list(self.check_registry.keys())
            
            for check_name in checks_to_run:
                if check_name in self.check_registry:
                    check_class = self.check_registry[check_name]
                    check_instance = check_class(session)
                    check_results = await check_instance.check()
                    results.extend(check_results)
            
            audit_data = {
                'audit_id': audit_id,
                'account_id': account_id,
                'status': 'completed',
                'started_at': started_at,
                'completed_at': datetime.utcnow(),
                'results': results,
                'summary': self._generate_summary(results)
            }
            
            self.audits[audit_id] = audit_data
            return audit_data
        
        except Exception as e:
            audit_data = {
                'audit_id': audit_id,
                'account_id': account_id,
                'status': 'failed',
                'started_at': started_at,
                'error': str(e)
            }
            self.audits[audit_id] = audit_data
            raise
    
    def get_audit_status(self, audit_id: str) -> Dict:
        if audit_id not in self.audits:
            raise Exception(f"Audit {audit_id} not found")
        return self.audits[audit_id]
    
    def _generate_summary(self, results: List[Dict]) -> Dict:
        summary = {
            'total': len(results),
            'pass': 0,
            'fail': 0,
            'warn': 0,
            'error': 0
        }
        
        for result in results:
            status = result['status'].lower()
            if status in summary:
                summary[status] += 1
        
        return summary
