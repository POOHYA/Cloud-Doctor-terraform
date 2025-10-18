from fastapi import APIRouter, HTTPException
from app.models.audit import AuditRequest, AuditResponse
from app.services.audit_service import AuditService

router = APIRouter()
audit_service = AuditService()

@router.post("/start", response_model=AuditResponse)
async def start_audit(request: AuditRequest):
    try:
        result = await audit_service.run_audit(
            request.account_id,
            request.role_name,
            request.checks,
            request.external_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{audit_id}", response_model=AuditResponse)
async def get_audit_status(audit_id: str):
    try:
        status = audit_service.get_audit_status(audit_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
