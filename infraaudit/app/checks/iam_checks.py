from .base_check import BaseCheck
from datetime import datetime
from typing import List, Dict

class IAMAccessKeyAgeCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        iam = self.session.client('iam')
        results = []
        
        try:
            users = iam.list_users()['Users']
            
            for user in users:
                username = user['UserName']
                access_keys = iam.list_access_keys(UserName=username)['AccessKeyMetadata']
                
                for key in access_keys:
                    key_age = (datetime.now(key['CreateDate'].tzinfo) - key['CreateDate']).days
                    
                    if key_age > 90:
                        results.append(self.get_result(
                            'FAIL',
                            key['AccessKeyId'],
                            f"Access key for {username} is {key_age} days old (>90)",
                            {'username': username, 'age_days': key_age}
                        ))
                    else:
                        results.append(self.get_result(
                            'PASS',
                            key['AccessKeyId'],
                            f"Access key for {username} is {key_age} days old",
                            {'username': username, 'age_days': key_age}
                        ))
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return results

class IAMRootAccessKeyCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        iam = self.session.client('iam')
        results = []
        
        try:
            summary = iam.get_account_summary()['SummaryMap']
            root_keys = summary.get('AccountAccessKeysPresent', 0)
            
            if root_keys > 0:
                results.append(self.get_result(
                    'FAIL', 'root', 'Root account has access keys',
                    {'key_count': root_keys}
                ))
            else:
                results.append(self.get_result(
                    'PASS', 'root', 'Root account has no access keys'
                ))
        except Exception as e:
            results.append(self.get_result('ERROR', 'root', str(e)))
        
        return results

class IAMRootMFACheck(BaseCheck):
    async def check(self) -> List[Dict]:
        iam = self.session.client('iam')
        results = []
        
        try:
            summary = iam.get_account_summary()['SummaryMap']
            mfa_enabled = summary.get('AccountMFAEnabled', 0)
            
            if mfa_enabled == 0:
                results.append(self.get_result(
                    'FAIL', 'root', 'Root account MFA not enabled'
                ))
            else:
                results.append(self.get_result(
                    'PASS', 'root', 'Root account MFA enabled'
                ))
        except Exception as e:
            results.append(self.get_result('ERROR', 'root', str(e)))
        
        return results
