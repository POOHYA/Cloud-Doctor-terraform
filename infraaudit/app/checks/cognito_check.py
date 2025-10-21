from .base_check import BaseCheck
from datetime import datetime
from typing import List, Dict
import json

class CognitoTokenExpirationCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        cognito = self.session.client('cognito-idp')
        results = []
        raw = []
        
        try:
            user_pools = cognito.list_user_pools(MaxResults=60)
            
            if not user_pools['UserPools']:
                results.append(self.get_result(
                    '양호', 'N/A',
                    "Cognito 사용자 풀이 존재하지 않습니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 40}
            
            for pool in user_pools['UserPools']:
                pool_id = pool['Id']
                pool_name = pool['Name']
                
                try:
                    app_clients = cognito.list_user_pool_clients(UserPoolId=pool_id)
                    
                    for client in app_clients['UserPoolClients']:
                        client_id = client['ClientId']
                        client_name = client['ClientName']
                        
                        try:
                            client_details = cognito.describe_user_pool_client(
                                UserPoolId=pool_id,
                                ClientId=client_id
                            )
                            
                            client_data = client_details['UserPoolClient']
                            
                            access_token_validity = client_data.get('AccessTokenValidity', 60)  # 기본값 60분
                            id_token_validity = client_data.get('IdTokenValidity', 60)  # 기본값 60분
                            refresh_token_validity = client_data.get('RefreshTokenValidity', 30)  # 기본값 30일
                            token_validity_units = client_data.get('TokenValidityUnits', {})
                            
                            # 단위 확인 (기본값은 분/일)
                            access_unit = token_validity_units.get('AccessToken', 'minutes')
                            id_unit = token_validity_units.get('IdToken', 'minutes')
                            refresh_unit = token_validity_units.get('RefreshToken', 'days')
                            
                            raw.append({
                                'pool_id': pool_id,
                                'client_id': client_id,
                                'client_name': client_name,
                                'token_settings': {
                                    'access_token_validity': access_token_validity,
                                    'id_token_validity': id_token_validity,
                                    'refresh_token_validity': refresh_token_validity,
                                    'token_validity_units': token_validity_units
                                }
                            })
                            
                            issues = []
                            
                            # 액세스 토큰 확인 (60분 초과)
                            if access_unit == 'minutes' and access_token_validity > 60:
                                issues.append(f"액세스 토큰 유효기간: {access_token_validity}분 (권장: 60분 이하)")
                            elif access_unit == 'hours' and access_token_validity > 1:
                                issues.append(f"액세스 토큰 유효기간: {access_token_validity}시간 (권장: 1시간 이하)")
                            
                            # ID 토큰 확인 (60분 초과)
                            if id_unit == 'minutes' and id_token_validity > 60:
                                issues.append(f"ID 토큰 유효기간: {id_token_validity}분 (권장: 60분 이하)")
                            elif id_unit == 'hours' and id_token_validity > 1:
                                issues.append(f"ID 토큰 유효기간: {id_token_validity}시간 (권장: 1시간 이하)")
                            
                            # 갱신 토큰 확인 (30일 초과)
                            if refresh_unit == 'days' and refresh_token_validity > 30:
                                issues.append(f"갱신 토큰 유효기간: {refresh_token_validity}일 (권장: 30일 이하)")
                            
                            if issues:
                                results.append(self.get_result(
                                    '취약', f"{pool_name}/{client_name}",
                                    f"앱 클라이언트 {client_name}의 토큰 유효기간이 권장값을 초과합니다: {', '.join(issues)}",
                                    {
                                        'pool_id': pool_id,
                                        'client_id': client_id,
                                        'access_token_validity': f"{access_token_validity} {access_unit}",
                                        'id_token_validity': f"{id_token_validity} {id_unit}",
                                        'refresh_token_validity': f"{refresh_token_validity} {refresh_unit}",
                                        'issues': issues
                                    }
                                ))
                            else:
                                results.append(self.get_result(
                                    '양호', f"{pool_name}/{client_name}",
                                    f"앱 클라이언트 {client_name}의 토큰 유효기간이 적절히 설정되어 있습니다.",
                                    {
                                        'pool_id': pool_id,
                                        'client_id': client_id,
                                        'access_token_validity': f"{access_token_validity} {access_unit}",
                                        'id_token_validity': f"{id_token_validity} {id_unit}",
                                        'refresh_token_validity': f"{refresh_token_validity} {refresh_unit}"
                                    }
                                ))
                                
                        except Exception as e:
                            results.append(self.get_result('ERROR', f"{pool_name}/{client_name}", f"클라이언트 {client_name} 확인 중 오류: {str(e)}"))
                            
                except Exception as e:
                    results.append(self.get_result('ERROR', pool_name, f"사용자 풀 {pool_name} 확인 중 오류: {str(e)}"))
                    
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 40}