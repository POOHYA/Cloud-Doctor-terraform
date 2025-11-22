import os
from dotenv import load_dotenv
load_dotenv()  # .env 파일 로드

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import audit

app = FastAPI(title="CloudDoctor InfraAudit API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://localhost:3000",
        "https://localhost:3001",
        "https://web.takustory.site",
        "https://webs.takustory.site",
        "https://back.takustory.site",
        "https://audit.takustory.site",
        "https://api.cloud-doctor.site",
        "https://www.cloud-doctor.site",
        "https://cloud-doctor.site"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audit.router, prefix="/api/audit", tags=["audit"])

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        ssl_keyfile="../frontend/cloud-doctor/localhost-key.pem",
        ssl_certfile="../frontend/cloud-doctor/localhost.pem"
    )
