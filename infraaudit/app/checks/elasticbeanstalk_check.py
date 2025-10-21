from .base_check import BaseCheck
from datetime import datetime
from typing import List, Dict
import json

class ElasticBeanstalkCredentialsCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        eb = self.session.client('elasticbeanstalk')
        results = []
        raw = []
        
        try:
            applications = eb.describe_applications()
            
            if not applications['Applications']:
                return {'results': results, 'raw': raw, 'guideline_id': 43}
            
            for app in applications['Applications']:
                app_name = app['ApplicationName']
                
                try:
                    environments = eb.describe_environments(ApplicationName=app_name)
                    
                    for env in environments['Environments']:
                        env_name = env['EnvironmentName']
                        env_id = env['EnvironmentId']
                        
                        try:
                            config = eb.describe_configuration_settings(
                                ApplicationName=app_name,
                                EnvironmentName=env_name
                            )
                            
                            env_properties = {}
                            for setting in config['ConfigurationSettings'][0]['OptionSettings']:
                                if setting['Namespace'] == 'aws:elasticbeanstalk:application:environment':
                                    env_properties[setting['OptionName']] = setting['Value']
                            
                            raw.append({
                                'app_name': app_name,
                                'env_name': env_name,
                                'env_id': env_id,
                                'env_properties': env_properties
                            })
                            
                            vulnerable_keys = []
                            
                            # 민감한 키워드 패턴 확인
                            sensitive_patterns = [
                                'password', 'passwd', 'pwd',
                                'aws_access_key_id', 'access_key',
                                'aws_secret_access_key', 'secret_key', 'secret_access_key',
                                'api_key', 'apikey',
                                'token', 'auth_token',
                                'private_key', 'cert', 'certificate'
                            ]
                            
                            for key, value in env_properties.items():
                                key_lower = key.lower()
                                for pattern in sensitive_patterns:
                                    if pattern in key_lower and value:
                                        vulnerable_keys.append(f"{key}: {value[:10]}..." if len(value) > 10 else f"{key}: {value}")
                                        break
                            
                            if vulnerable_keys:
                                results.append(self.get_result(
                                    'FAIL', f"{app_name}/{env_name}",
                                    f"Elastic Beanstalk 환경 {env_name}의 환경 속성에 민감한 정보가 평문으로 저장되어 있습니다: {', '.join(vulnerable_keys)}, 환경 생성 시, 환경 속성 속 민감 정보는 Secrets Manager나 SSM Parameter Store로 사용하세요.",
                                    {
                                        'app_name': app_name,
                                        'env_name': env_name,
                                        'env_id': env_id,
                                        'vulnerable_keys': vulnerable_keys,
                                        'total_env_vars': len(env_properties)
                                    }
                                ))
                            else:
                                results.append(self.get_result(
                                    'PASS', f"{app_name}/{env_name}",
                                    f"Elastic Beanstalk 환경 {env_name}의 환경 속성에 민감한 정보가 발견되지 않았습니다.",
                                    {
                                        'app_name': app_name,
                                        'env_name': env_name,
                                        'env_id': env_id,
                                        'total_env_vars': len(env_properties)
                                    }
                                ))
                                
                        except Exception as e:
                            results.append(self.get_result('ERROR', f"{app_name}/{env_name}", f"환경 {env_name} 확인 중 오류: {str(e)}"))
                            
                except Exception as e:
                    results.append(self.get_result('ERROR', app_name, f"애플리케이션 {app_name} 확인 중 오류: {str(e)}"))
                    
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 43}