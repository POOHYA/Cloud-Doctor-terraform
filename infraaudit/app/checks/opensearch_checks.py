import json
from .base_check import BaseCheck
from typing import List, Dict

class OpenSearchSecurityCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        opensearch = self.session.client('opensearch')
        results = []
        raw = []
        
        try:
            domains = opensearch.list_domain_names()
            
            if not domains.get('DomainNames'):
                return {'results': results, 'raw': raw, 'guideline_id': 42}
            
            for domain_info in domains['DomainNames']:
                domain_name = domain_info['DomainName']
                
                try:
                    domain_config = opensearch.describe_domain(DomainName=domain_name)
                    domain_data = domain_config['DomainStatus']
                    
                    vpc_options = domain_data.get('VPCOptions', {})
                    access_policies = domain_data.get('AccessPolicies')
                    
                    raw.append({
                        'domain_name': domain_name,
                        'vpc_options': vpc_options,
                        'access_policies': access_policies
                    })
                    
                    vulnerable = False
                    issues = []
                    
                    # Public access 확인
                    if not vpc_options or not vpc_options.get('VPCId'):
                        vulnerable = True
                        issues.append("Public access(인터넷 노출)로 설정됨")
                    
                    # Access Policy 확인
                    if access_policies:
                        try:
                            policy = json.loads(access_policies)
                            for statement in policy.get('Statement', []):
                                if statement.get('Effect') == 'Allow':
                                    principal = statement.get('Principal', {})
                                    actions = statement.get('Action', [])
                                    
                                    if principal == "*" or (isinstance(principal, dict) and principal.get('AWS') == "*"):
                                        if isinstance(actions, str):
                                            actions = [actions]
                                        
                                        dangerous_actions = []
                                        for action in actions:
                                            if action == 'es:*' or action.startswith('es:ESHttp') or action == '*':
                                                dangerous_actions.append(action)
                                        
                                        if dangerous_actions:
                                            vulnerable = True
                                            issues.append(f"Principal '*'에 광범위한 권한 부여: {', '.join(dangerous_actions)}")
                        except Exception:
                            pass
                    
                    if vulnerable:
                        results.append(self.get_result(
                            '취약', domain_name,
                            f"OpenSearch 도메인 {domain_name}에서 보안 위험이 발견되었습니다: {', '.join(issues)}",
                            {
                                'domain_name': domain_name,
                                'vpc_enabled': bool(vpc_options.get('VPCId')),
                                'vpc_id': vpc_options.get('VPCId'),
                                'access_policies': access_policies,
                                'issues': issues
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            '양호', domain_name,
                            f"OpenSearch 도메인 {domain_name}의 네트워크 및 액세스 정책이 적절히 설정되어 있습니다.",
                            {
                                'domain_name': domain_name,
                                'vpc_enabled': bool(vpc_options.get('VPCId')),
                                'vpc_id': vpc_options.get('VPCId'),
                                'access_policies': access_policies
                            }
                        ))
                        
                except Exception as e:
                    results.append(self.get_result('ERROR', domain_name, f"도메인 {domain_name} 확인 중 오류: {str(e)}"))
                    
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 42}

class OpenSearchVPCAccessCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        opensearch = self.session.client('opensearch')
        results = []
        raw = []
        
        try:
            domains = opensearch.list_domain_names()
            
            if not domains.get('DomainNames'):
                results.append(self.get_result(
                    'PASS', 'N/A',
                    "OpenSearch 도메인이 없습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 52}
            
            for domain_info in domains['DomainNames']:
                domain_name = domain_info.get('DomainName')
                
                try:
                    domain = opensearch.describe_domain(DomainName=domain_name)
                    domain_status = domain.get('DomainStatus', {})
                    
                    vpc_options = domain_status.get('VPCOptions', {})
                    vpc_id = vpc_options.get('VPCId')
                    
                    raw.append({
                        'domain_name': domain_name,
                        'vpc_id': vpc_id,
                        'vpc_options': vpc_options,
                        'domain_data': domain_status
                    })
                    
                    if vpc_id:
                        results.append(self.get_result(
                            'PASS', domain_name,
                            f"OpenSearch 도메인 {domain_name}은 VPC 액세스 전용으로 설정되어 있습니다.",
                            {
                                'domain_name': domain_name,
                                'vpc_id': vpc_id,
                                'subnet_ids': vpc_options.get('SubnetIds', [])
                            }
                        ))
                    else:
                        results.append(self.get_result(
                            'FAIL', domain_name,
                            f"OpenSearch 도메인 {domain_name}이 퍼블릭 엔드포인트로 설정되어 있습니다. | VPC 액세스 전용으로 설정하세요.",
                            {
                                'domain_name': domain_name,
                                'vpc_id': None
                            }
                        ))
                
                except Exception as e:
                    results.append(self.get_result('ERROR', domain_name, str(e)))
        
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 52}