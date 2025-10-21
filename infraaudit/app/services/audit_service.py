import uuid
from datetime import datetime
from typing import Dict, List
from app.core.aws_client import AWSClientManager
from app.checks.ec2_checks import EC2IMDSv2Check, EC2PublicIPCheck, EC2AMIPrivateCheck, EBSSnapshotPrivateCheck
from app.checks.eks_checks import EKSIRSARoleCheck
from app.checks.kms_checks import KMSImportedKeyMaterialCheck
from app.checks.base_check import BaseCheck
from app.checks.iam_checks import IAMRootMFACheck, IAMTrustPolicyWildcardCheck, IAMPassRoleWildcardResourceCheck, IAMIdPAssumeRoleCheck, IAMCrossAccountAssumeRoleCheck, IAMAccessKeyAgeCheck, IAMRootAccessKeyCheck, IAMMFACheck
from app.checks.s3_checks import S3PublicAccessAndPolicyCheck, S3ACLCheck, S3ReplicationRuleCheck 
from app.checks.cloudformation_check import IAMRoleCloudFormationPassRoleCheck
from app.checks.cloudtrail_check import CloudTrailManagementEventsCheck, CloudTrailLoggingCheck
from app.checks.cognito_check import CognitoTokenExpirationCheck
from app.checks.elasticbeanstalk_check import ElasticBeanstalkCredentialsCheck
from app.checks.glue_check import IAMGluePassRoleCheck
from app.checks.guardduty_checks import GuardDutyStatusCheck
from app.checks.opensearch_checks import OpenSearchSecurityCheck, IAMGluePassRoleCheck
from app.checks.organizations_check import OrganizationsSCPCheck
from app.checks.rds_check import RDSPublicAccessibilityCheck
from app.checks.sns_check import SNSAccessPolicyCheck
from app.checks.sqs_check import SQSAccessPolicyCheck
from app.checks.ssm_check import IAMSSMCommandPolicyCheck
from app.checks.bedrock_checks import BedrockModelAccessCheck
from app.checks.appstream_checks import AppStreamOverlyPermissiveCheck
from app.checks.ses_checks import SESOverlyPermissiveCheck

class AuditService:
    def __init__(self):
        self.aws_client_manager = AWSClientManager()
        self.audits: Dict[str, Dict] = {}
        
        self.check_registry = {
            'IAMRootMFACheck': IAMRootMFACheck,
            'IAMTrustPolicyWildcardCheck': IAMTrustPolicyWildcardCheck,
            'IAMPassRoleWildcardResourceCheck': IAMPassRoleWildcardResourceCheck,
            'IAMIdPAssumeRoleCheck': IAMIdPAssumeRoleCheck,
            'IAMCrossAccountAssumeRoleCheck': IAMCrossAccountAssumeRoleCheck,
            'IAMAccessKeyAgeCheck': IAMAccessKeyAgeCheck,
            'IAMRootAccessKeyCheck': IAMRootAccessKeyCheck,
            'IAMMFACheck': IAMMFACheck,
            'S3PublicAccessAndPolicyCheck': S3PublicAccessAndPolicyCheck,
            'S3ACLCheck': S3ACLCheck,
            'S3ReplicationRuleCheck': S3ReplicationRuleCheck,
            'EC2IMDSv2Check': EC2IMDSv2Check,
            'EC2PublicIPCheck': EC2PublicIPCheck,
            'EC2AMIPrivateCheck': EC2AMIPrivateCheck,
            'EBSSnapshotPrivateCheck': EBSSnapshotPrivateCheck,
            'EKSIRSARoleCheck': EKSIRSARoleCheck,
            'KMSImportedKeyMaterialCheck': KMSImportedKeyMaterialCheck,
            'IAMRoleCloudFormationPassRoleCheck': IAMRoleCloudFormationPassRoleCheck,
            'CloudTrailManagementEventsCheck': CloudTrailManagementEventsCheck, 
            'CloudTrailLoggingCheck': CloudTrailLoggingCheck,
            'CognitoTokenExpirationCheck': CognitoTokenExpirationCheck,
            'ElasticBeanstalkCredentialsCheck': ElasticBeanstalkCredentialsCheck,
            'IAMGluePassRoleCheck': IAMGluePassRoleCheck,
            'GuardDutyStatusCheck': GuardDutyStatusCheck,
            'OpenSearchSecurityCheck': OpenSearchSecurityCheck,
            'OrganizationsSCPCheck': OrganizationsSCPCheck,
            'RDSPublicAccessibilityCheck': RDSPublicAccessibilityCheck,
            'SNSAccessPolicyCheck': SNSAccessPolicyCheck,
            'SQSAccessPolicyCheck': SQSAccessPolicyCheck,
            'SESOverlyPermissiveCheck': SESOverlyPermissiveCheck,
            'IAMSSMCommandPolicyCheck': IAMSSMCommandPolicyCheck,
            'BedrockModelAccessCheck': BedrockModelAccessCheck,
            'AppStreamOverlyPermissiveCheck': AppStreamOverlyPermissiveCheck,
        }
    
    async def run_audit(self, account_id: str, role_name: str, checks: List[str] = None, external_id: str = None) -> Dict:
        audit_id = str(uuid.uuid4())
        started_at = datetime.utcnow()
        
        try:
            credentials = self.aws_client_manager.assume_role(account_id, role_name, external_id)
            session = self.aws_client_manager.get_session(credentials)
            
            results = []
            raw_data = {}
            guideline_ids = {}
            checks_to_run = checks if checks else list(self.check_registry.keys())
            
            for check_name in checks_to_run:
                if check_name in self.check_registry:
                    check_class = self.check_registry[check_name]
                    check_instance = check_class(session)
                    check_results = await check_instance.check()
                    
                    if isinstance(check_results, dict) and 'results' in check_results:
                        for result in check_results['results']:
                            result['check_id'] = check_name
                        results.extend(check_results['results'])
                        if 'raw' in check_results:
                            raw_data[check_name] = check_results['raw']
                        if 'guideline_id' in check_results:
                            guideline_ids[check_name] = check_results['guideline_id']
                    else:
                        for result in check_results:
                            result['check_id'] = check_name
                        results.extend(check_results)
            
            audit_data = {
                'audit_id': audit_id,
                'account_id': account_id,
                'status': 'completed',
                'started_at': started_at,
                'completed_at': datetime.utcnow(),
                'results': results,
                'raw': raw_data,
                'guideline_ids': guideline_ids,
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
