from abc import ABC, abstractmethod
from typing import List, Dict
import boto3

class BaseCheck(ABC):
    def __init__(self, session: boto3.Session):
        self.session = session
    
    @abstractmethod
    async def check(self) -> List[Dict]:
        pass
    
    def get_result(self, status: str, resource_id: str, message: str, details: Dict = None) -> Dict:
        return {
            'check_id': self.__class__.__name__,
            'status': status,
            'resource_id': resource_id,
            'message': message,
            'details': details or {}
        }