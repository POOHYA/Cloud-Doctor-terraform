from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class AuditRequest(BaseModel):
    account_id: str
    role_name: str = "CloudDoctorAuditRole"
    external_id: Optional[str] = None
    checks: Optional[List[str]] = None

class CheckResult(BaseModel):
    check_id: str
    status: str
    resource_id: str
    message: str
    details: Optional[Dict] = None

class AuditResponse(BaseModel):
    audit_id: str
    account_id: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    results: Optional[List[CheckResult]] = None
    summary: Optional[Dict] = None
    guideline_ids: Optional[Dict[str, int]] = None
    error: Optional[str] = None
