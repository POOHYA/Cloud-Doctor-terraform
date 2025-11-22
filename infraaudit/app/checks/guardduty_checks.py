from .base_check import BaseCheck
from datetime import datetime
from typing import List, Dict
import json

class GuardDutyStatusCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        guardduty = self.session.client('guardduty')
        organizations = self.session.client('organizations')
        results = []
        raw = []
        
        try:
            # 현재 리전에서 GuardDuty 상태 확인
            detectors = guardduty.list_detectors()
            
            if not detectors['DetectorIds']:
                results.append(self.get_result(
                    'FAIL', 'N/A',
                    "현재 리전에서 GuardDuty가 활성화되지 않았습니다. 관리자 계정에서 모든 멤버 계정과 모든 사용 리전에 일괄 활성화를 적용하고 신규 계정 자동 가입을 설정해야 합니다."
                ))
                return {'results': results, 'raw': raw, 'guideline_id': 37}
            
            for detector_id in detectors['DetectorIds']:
                try:
                    detector = guardduty.get_detector(DetectorId=detector_id)
                    
                    raw.append({
                        'detector_id': detector_id,
                        'detector_status': detector['Status'],
                        'detector_data': detector
                    })
                    
                    if detector['Status'] != 'ENABLED':
                        results.append(self.get_result(
                            'FAIL', detector_id,
                            f"GuardDuty 탐지기 {detector_id}가 비활성화 상태입니다: {detector['Status']} 관리자 계정에서 모든 멤버 계정과 모든 사용 리전에 일괄 활성화를 적용하고 신규 계정 자동 가입을 설정해야 합니다.",
                            {
                                'detector_id': detector_id,
                                'status': detector['Status'],
                                'service_role': detector.get('ServiceRole'),
                                'finding_publishing_frequency': detector.get('FindingPublishingFrequency')
                            }
                        ))
                    else:
                        # Organizations 연동 확인
                        try:
                            admin_account = guardduty.get_administrator_account()
                            org_config = guardduty.describe_organization_configuration(DetectorId=detector_id)
                            
                            auto_enable = org_config.get('AutoEnable', False)
                            
                            if not auto_enable:
                                results.append(self.get_result(
                                    'FAIL', detector_id,
                                    f"GuardDuty 탐지기 {detector_id}에서 신규 계정 자동 등록이 비활성화되어 있습니다. 관리자 계정에서 모든 멤버 계정과 모든 사용 리전에 일괄 활성화를 적용하고 신규 계정 자동 가입을 설정해야 합니다.",
                                    {
                                        'detector_id': detector_id,
                                        'status': detector['Status'],
                                        'auto_enable': auto_enable,
                                        'org_config': org_config
                                    }
                                ))
                            else:
                                results.append(self.get_result(
                                    'PASS', detector_id,
                                    f"GuardDuty 탐지기 {detector_id}가 활성화되어 있고 신규 계정 자동 등록이 설정되어 있습니다.",
                                    {
                                        'detector_id': detector_id,
                                        'status': detector['Status'],
                                        'auto_enable': auto_enable,
                                        'org_config': org_config
                                    }
                                ))
                        except Exception:
                            # Organizations 연동이 없는 경우
                            results.append(self.get_result(
                                'PASS', detector_id,
                                f"GuardDuty 탐지기 {detector_id}가 활성화되어 있습니다.",
                                {
                                    'detector_id': detector_id,
                                    'status': detector['Status'],
                                    'service_role': detector.get('ServiceRole')
                                }
                            ))
                        
                except Exception as e:
                    results.append(self.get_result('ERROR', detector_id, f"탐지기 {detector_id} 확인 중 오류: {str(e)}"))
                    
        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))
        
        return {'results': results, 'raw': raw, 'guideline_id': 37}