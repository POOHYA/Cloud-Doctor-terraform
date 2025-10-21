from .base_check import BaseCheck
from datetime import datetime
from typing import List, Dict

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
                    '양호', 'root', 'Root account MFA enabled'
                ))
        except Exception as e:
            results.append(self.get_result('오류', 'root', str(e)))
        
        return results

class IAMTrustPolicyWildcardCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        iam = self.session.client('iam')
        results = []
        raw = []
        
        try:
            roles = iam.list_roles()['Roles']
            
            if not roles:
                return {'results': results, 'raw': raw, 'guideline_id': 13}
            
            for role in roles:
                role_name = role['RoleName']
                trust_policy = role['AssumeRolePolicyDocument']
                
                raw.append({
                    'role_name': role_name,
                    'trust_policy': trust_policy,
                    'role_data': role
                })
                
                has_wildcard_without_condition = False
                
                for statement in trust_policy.get('Statement', []):
                    principal = statement.get('Principal', {})
                    condition = statement.get('Condition')
                    
                    # Principal이 "*"이고 Condition이 없는 경우
                    if principal == "*" and not condition:
                        has_wildcard_without_condition = True
                        break
                    # Principal이 dict이고 AWS가 "*"인 경우
                    elif isinstance(principal, dict) and principal.get('AWS') == "*" and not condition:
                        has_wildcard_without_condition = True
                        break
                
                if has_wildcard_without_condition:
                    results.append(self.get_result(
                        '취약', role_name,
                        f"역할 {role_name}의 신뢰 정책에 Principal이 '*'로 설정되어 있고 Condition이 없습니다. Trust Policy의 Principal: *를 제거하고, 사용할 계정/역할/서비스의 ARN만 명시해야 합니다.",
                        {
                            'role_name': role_name,
                            'trust_policy': trust_policy,
                            'has_wildcard_principal': True,
                            'has_condition': False
                        }
                    ))
                else:
                    results.append(self.get_result(
                        '양호', role_name,
                        f"역할 {role_name}의 신뢰 정책이 적절히 구성되어 있습니다.",
                        {
                            'role_name': role_name,
                            'trust_policy': trust_policy,
                            'has_wildcard_principal': False
                        }
                    ))
        except Exception as e:
            results.append(self.get_result('오류', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 13}

class IAMPassRoleWildcardResourceCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        iam = self.session.client('iam')
        results = []
        raw = []
        
        try:
            entities = []
            
            # 사용자 정책 수집
            users = iam.list_users()['Users']
            for user in users:
                user_name = user['UserName']
                # 인라인 정책
                inline_policies = iam.list_user_policies(UserName=user_name)['PolicyNames']
                for policy_name in inline_policies:
                    policy_doc = iam.get_user_policy(UserName=user_name, PolicyName=policy_name)
                    entities.append({
                        'type': 'user',
                        'name': user_name,
                        'policy_name': policy_name,
                        'policy_document': policy_doc['PolicyDocument']
                    })
                
                # 연결된 관리형 정책
                attached_policies = iam.list_attached_user_policies(UserName=user_name)['AttachedPolicies']
                for policy in attached_policies:
                    policy_arn = policy['PolicyArn']
                    policy_version = iam.get_policy(PolicyArn=policy_arn)['Policy']['DefaultVersionId']
                    policy_doc = iam.get_policy_version(PolicyArn=policy_arn, VersionId=policy_version)
                    entities.append({
                        'type': 'user',
                        'name': user_name,
                        'policy_name': policy['PolicyName'],
                        'policy_document': policy_doc['PolicyVersion']['Document']
                    })
            
            # 역할 정책 수집
            roles = iam.list_roles()['Roles']
            for role in roles:
                role_name = role['RoleName']
                # 인라인 정책
                inline_policies = iam.list_role_policies(RoleName=role_name)['PolicyNames']
                for policy_name in inline_policies:
                    policy_doc = iam.get_role_policy(RoleName=role_name, PolicyName=policy_name)
                    entities.append({
                        'type': 'role',
                        'name': role_name,
                        'policy_name': policy_name,
                        'policy_document': policy_doc['PolicyDocument']
                    })
                
                # 연결된 관리형 정책
                attached_policies = iam.list_attached_role_policies(RoleName=role_name)['AttachedPolicies']
                for policy in attached_policies:
                    policy_arn = policy['PolicyArn']
                    policy_version = iam.get_policy(PolicyArn=policy_arn)['Policy']['DefaultVersionId']
                    policy_doc = iam.get_policy_version(PolicyArn=policy_arn, VersionId=policy_version)
                    entities.append({
                        'type': 'role',
                        'name': role_name,
                        'policy_name': policy['PolicyName'],
                        'policy_document': policy_doc['PolicyVersion']['Document']
                    })
            
            if not entities:
                return {'results': results, 'raw': raw, 'guideline_id': 14}
            
            # 각 정책에서 iam:PassRole 검사
            for entity in entities:
                entity_type = entity['type']
                entity_name = entity['name']
                policy_name = entity['policy_name']
                policy_document = entity['policy_document']
                
                raw.append({
                    'entity_type': entity_type,
                    'entity_name': entity_name,
                    'policy_name': policy_name,
                    'policy_document': policy_document
                })
                
                has_wildcard_passrole = False
                passrole_resources = []
                
                for statement in policy_document.get('Statement', []):
                    if isinstance(statement, dict):
                        actions = statement.get('Action', [])
                        resources = statement.get('Resource', [])
                        
                        # Action을 리스트로 변환
                        if isinstance(actions, str):
                            actions = [actions]
                        
                        # Resource를 리스트로 변환
                        if isinstance(resources, str):
                            resources = [resources]
                        
                        # iam:PassRole 액션이 있는지 확인
                        has_passrole = any(
                            action == 'iam:PassRole' or action == 'iam:*' or action == '*'
                            for action in actions
                        )
                        
                        if has_passrole:
                            passrole_resources.extend(resources)
                            # Resource가 "*" 또는 광범위한 패턴인지 확인
                            for resource in resources:
                                if (resource == "*" or 
                                    resource == "arn:aws:iam::*:role/*" or
                                    resource.endswith(":role/*")):
                                    has_wildcard_passrole = True
                
                # PassRole 권한이 있는 경우만 결과에 포함
                if passrole_resources:
                    if has_wildcard_passrole:
                        results.append(self.get_result(
                            '취약', f"{entity_type}:{entity_name}",
                            f"{entity_type} {entity_name}의 정책 {policy_name}에서 iam:PassRole의 Resource가 '*' 또는 광범위하게 설정되어 있습니다.",
                            {
                                'entity_type': entity_type,
                                'entity_name': entity_name,
                                'policy_name': policy_name,
                                'passrole_resources': passrole_resources,
                                'has_wildcard_resource': True
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            '양호', f"{entity_type}:{entity_name}",
                            f"{entity_type} {entity_name}의 정책 {policy_name}에서 iam:PassRole의 Resource가 적절히 제한되어 있습니다.",
                            {
                                'entity_type': entity_type,
                                'entity_name': entity_name,
                                'policy_name': policy_name,
                                'passrole_resources': passrole_resources,
                                'has_wildcard_resource': False
                            }
                        ))
                
        except Exception as e:
            results.append(self.get_result('오류', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 14}
    
class IAMIdPAssumeRoleCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        iam = self.session.client('iam')
        results = []
        raw = []
        
        try:
            roles = iam.list_roles()['Roles']
            
            if not roles:
                return {'results': results, 'raw': raw, 'guideline_id': 15}
            
            for role in roles:
                role_name = role['RoleName']
                trust_policy = role['AssumeRolePolicyDocument']
                
                raw.append({
                    'role_name': role_name,
                    'trust_policy': trust_policy,
                    'role_data': role
                })
                
                has_idp_issue = False
                
                for statement in trust_policy.get('Statement', []):
                    principal = statement.get('Principal', {})
                    condition = statement.get('Condition', {})
                    
                    # Federated Principal이 있는지 확인 (IdP 연동)
                    if isinstance(principal, dict) and 'Federated' in principal:
                        federated_principal = principal['Federated']
                        
                        # Principal이 특정 IdP ARN이 아닌 경우 (와일드카드나 광범위한 설정)
                        if (federated_principal == "*" or 
                            not federated_principal.startswith('arn:aws:iam::') or
                            ':saml-provider/' not in federated_principal and ':oidc-provider/' not in federated_principal):
                            has_idp_issue = True
                        
                        # Condition이 IdP 속성으로 제한되지 않은 경우
                        has_idp_condition = any(
                            key.startswith(('saml:', 'oidc:', 'token.actions.githubusercontent.com:'))
                            for condition_block in condition.values()
                            for key in (condition_block.keys() if isinstance(condition_block, dict) else [])
                        ) if condition else False
                        
                        if not has_idp_condition:
                            has_idp_issue = True
                
                # IdP 연동이 있는 역할만 결과에 포함
                if any('Federated' in statement.get('Principal', {}) 
                       for statement in trust_policy.get('Statement', [])
                       if isinstance(statement.get('Principal', {}), dict)):
                    
                    if has_idp_issue:
                        results.append(self.get_result(
                            '취약', role_name,
                            f"역할 {role_name}의 IdP 연동 설정에서 Principal이 특정 IdP ARN으로 제한되지 않거나 Condition이 IdP 속성으로 제한되지 않았습니다.",
                            {
                                'role_name': role_name,
                                'trust_policy': trust_policy,
                                'has_specific_idp_principal': False,
                                'has_idp_condition': False
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            '양호', role_name,
                            f"역할 {role_name}의 IdP 연동 설정이 적절히 구성되어 있습니다.",
                            {
                                'role_name': role_name,
                                'trust_policy': trust_policy,
                                'has_specific_idp_principal': True,
                                'has_idp_condition': True
                            }
                        ))
                        
        except Exception as e:
            results.append(self.get_result('오류', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 15}

class IAMCrossAccountAssumeRoleCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        iam = self.session.client('iam')
        results = []
        raw = []
        
        try:
            roles = iam.list_roles()['Roles']
            
            if not roles:
                return {'results': results, 'raw': raw, 'guideline_id': 16}
            
            for role in roles:
                role_name = role['RoleName']
                trust_policy = role['AssumeRolePolicyDocument']
                
                raw.append({
                    'role_name': role_name,
                    'trust_policy': trust_policy,
                    'role_data': role
                })
                
                has_cross_account_issue = False
                
                for statement in trust_policy.get('Statement', []):
                    principal = statement.get('Principal', {})
                    condition = statement.get('Condition', {})
                    
                    # AWS Principal이 있는지 확인 (Cross-Account)
                    if isinstance(principal, dict) and 'AWS' in principal:
                        aws_principal = principal['AWS']
                        
                        # Principal이 리스트인 경우 문자열로 변환
                        if isinstance(aws_principal, list):
                            aws_principal = aws_principal[0] if aws_principal else ""
                        
                        # Principal이 특정 ARN이 아닌 경우 (와일드카드나 광범위한 설정)
                        if (aws_principal == "*" or 
                            aws_principal.startswith('arn:aws:iam::*:') or
                            not aws_principal.startswith('arn:aws:iam::')):
                            has_cross_account_issue = True
                        
                        # Condition에 sts:ExternalId가 없는 경우
                        has_external_id = any(
                            'sts:ExternalId' in condition_block
                            for condition_block in condition.values()
                            if isinstance(condition_block, dict)
                        ) if condition else False
                        
                        if not has_external_id:
                            has_cross_account_issue = True
                
                # Cross-Account 역할만 결과에 포함 (AWS Principal이 있는 경우)
                if any(isinstance(statement.get('Principal', {}), dict) and 'AWS' in statement.get('Principal', {})
                       for statement in trust_policy.get('Statement', [])):
                    
                    if has_cross_account_issue:
                        results.append(self.get_result(
                            '취약', role_name,
                            f"역할 {role_name}의 Cross-Account 설정에서 Principal이 특정 ARN으로 제한되지 않거나 sts:ExternalId 조건이 없습니다.",
                            {
                                'role_name': role_name,
                                'trust_policy': trust_policy,
                                'has_specific_principal': False,
                                'has_external_id_condition': False
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            '양호', role_name,
                            f"역할 {role_name}의 Cross-Account 설정이 적절히 구성되어 있습니다.",
                            {
                                'role_name': role_name,
                                'trust_policy': trust_policy,
                                'has_specific_principal': True,
                                'has_external_id_condition': True
                            }
                        ))
                        
        except Exception as e:
            results.append(self.get_result('오류', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 16}

class IAMAccessKeyAgeCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        iam = self.session.client('iam')
        results = []
        raw = []
        
        try:
            users = iam.list_users()['Users']
            
            for user in users:
                username = user['UserName']
                access_keys = iam.list_access_keys(UserName=username)['AccessKeyMetadata']
                
                for key in access_keys:
                    key_age = (datetime.now(key['CreateDate'].tzinfo) - key['CreateDate']).days
                    access_key_id = key['AccessKeyId']
                    
                    raw.append({
                        'username': username,
                        'access_key_id': access_key_id,
                        'key_age_days': key_age,
                        'create_date': key['CreateDate'],
                        'status': key['Status'],
                        'key_data': key
                    })
                    
                    if key_age > 90:
                        results.append(self.get_result(
                            'FAIL',
                            access_key_id,
                            f"사용자 {username}의 액세스 키가 {key_age}일 이상 사용되고 있습니다. 90일 이내에 교체하세요.",
                            {
                                'username': username,
                                'age_days': key_age,
                                'status': key['Status']
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            '양호',
                            access_key_id,
                            f"사용자 {username}의 액세스 키는 {key_age}일 전에 생성되었습니다.",
                            {
                                'username': username,
                                'age_days': key_age,
                                'status': key['Status']
                            }
                        ))
        except Exception as e:
            results.append(self.get_result('오류', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 13}

class IAMRootAccessKeyCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        iam = self.session.client('iam')
        results = []
        raw = []
        
        try:
            summary = iam.get_account_summary()['SummaryMap']
            root_keys = summary.get('AccountAccessKeysPresent', 0)
            
            raw.append({
                'account_type': 'root',
                'access_keys_present': root_keys,
                'account_summary': summary
            })
            
            if root_keys > 0:
                results.append(self.get_result(
                    '취약', 'root',
                    f"Root 계정에 {root_keys}개의 액세스 키가 있습니다. 보안상 Root 계정의 액세스 키는 삭제해야 합니다.",
                    {
                        'key_count': root_keys,
                        'account_type': 'root'
                    }
                ))
            else:
                results.append(self.get_result(
                    '양호', 'root',
                    "Root 계정에 액세스 키가 없습니다."
                ))
        except Exception as e:
            results.append(self.get_result('오류', 'root', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 15}

class IAMMFACheck(BaseCheck):
    async def check(self) -> List[Dict]:
        iam = self.session.client('iam')
        results = []
        raw = []
        
        try:
            # Root 계정 MFA 확인
            summary = iam.get_account_summary()['SummaryMap']
            root_mfa_enabled = summary.get('AccountMFAEnabled', 0)
            
            # 모든 IAM 사용자 조회
            users_response = iam.list_users()
            users = users_response.get('Users', [])
            
            users_without_mfa = []
            users_with_mfa = []
            
            # 각 사용자의 MFA 확인
            for user in users:
                user_name = user.get('UserName')
                
                try:
                    mfa_devices = iam.list_mfa_devices(UserName=user_name)
                    mfa_device_list = mfa_devices.get('MFADevices', [])
                    
                    if mfa_device_list:
                        users_with_mfa.append({
                            'user_name': user_name,
                            'mfa_device_count': len(mfa_device_list)
                        })
                    else:
                        users_without_mfa.append(user_name)
                except:
                    users_without_mfa.append(user_name)
            
            raw.append({
                'root_mfa_enabled': root_mfa_enabled == 1,
                'total_users': len(users),
                'users_with_mfa': users_with_mfa,
                'users_without_mfa': users_without_mfa,
                'account_summary': summary
            })
            
            # Root 계정 MFA 미활성화
            if root_mfa_enabled == 0:
                results.append(self.get_result(
                    '취약', 'root',
                    "Root 계정에 MFA가 활성화되지 않았습니다. 루트를 포함한 모든 사용자 계정에 MFA가 설정되어야 합니다.",
                    {
                        'mfa_enabled': False,
                        'account_type': 'root'
                    }
                ))
            else:
                results.append(self.get_result(
                    '양호', 'root',
                    "Root 계정에 MFA가 활성화되어 있습니다.",
                    {
                        'mfa_enabled': True,
                        'account_type': 'root'
                    }
                ))
            
            # IAM 사용자 MFA 확인
            if users_without_mfa:
                results.append(self.get_result(
                    '취약', 'iam_users',
                    f"다음 IAM 사용자에 MFA가 설정되지 않았습니다: {', '.join(users_without_mfa)}. 모든 사용자 계정에 MFA가 설정되어야 합니다.",
                    {
                        'users_without_mfa': users_without_mfa,
                        'users_with_mfa_count': len(users_with_mfa),
                        'users_without_mfa_count': len(users_without_mfa)
                    }
                ))
            elif len(users) > 0:
                results.append(self.get_result(
                    '통과', 'iam_users',
                    f"모든 IAM 사용자에 MFA가 설정되어 있습니다.",
                    {
                        'users_with_mfa_count': len(users_with_mfa),
                        'total_users': len(users)
                    }
                ))
            
        except Exception as e:
            results.append(self.get_result('오류', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 16}