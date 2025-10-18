# InfraAudit - AWS 인프라 보안 점검 서비스 (FastAPI)

## 아키텍처

```
고객 AWS 계정
    └── Trust Policy (CloudDoctorAuditRole)
         └── AssumeRole 허용 (ExternalId 사용)
              └── SaaS AWS 계정 (우리 계정)
                   └── FastAPI 서버
                        └── 보안 점검 실행 (비동기)
```

## 폴더 구조

```
infraaudit/
├── main.py                          # FastAPI 메인 애플리케이션
├── requirements.txt                 # Python 의존성
├── .env.example                     # 환경 변수 예시
├── app/
│   ├── api/
│   │   └── audit.py                # API 라우터
│   ├── core/
│   │   └── aws_client.py           # AWS 클라이언트 및 AssumeRole
│   ├── services/
│   │   └── audit_service.py        # 보안 점검 서비스 로직
│   ├── checks/
│   │   ├── base_check.py           # 점검 베이스 클래스
│   │   ├── iam_checks.py           # IAM 보안 점검
│   │   ├── s3_checks.py            # S3 보안 점검
│   │   └── ec2_checks.py           # EC2 보안 점검
│   └── models/
│       └── audit.py                # Pydantic 모델
└── tests/
```

## 설치 및 실행

```bash
cd infraaudit
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# .env 파일 수정
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API 엔드포인트

### 1. 보안 점검 시작

```bash
POST http://localhost:8000/api/audit/start
Content-Type: application/json

{
  "account_id": "123456789012",
  "role_name": "CloudDoctorAuditRole",
  "external_id": "unique-external-id",
  "checks": ["iam_access_key_age", "s3_public_access"]
}
```

### 2. 점검 상태 조회

```bash
GET http://localhost:8000/api/audit/status/{audit_id}
```

### 3. Health Check

```bash
GET http://localhost:8000/health
```

## Trust Policy 설정 (고객 계정)

고객 AWS 계정에 다음 Trust Policy를 가진 Role 생성:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_SAAS_ACCOUNT_ID:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "unique-external-id"
        }
      }
    }
  ]
}
```

## IAM Policy (고객 계정 Role에 연결)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iam:ListUsers",
        "iam:ListAccessKeys",
        "iam:GetAccountSummary",
        "s3:ListAllMyBuckets",
        "s3:GetBucketPublicAccessBlock",
        "s3:GetBucketEncryption",
        "ec2:DescribeInstances"
      ],
      "Resource": "*"
    }
  ]
}
```

## 지원 점검 항목

### IAM

- `iam_access_key_age`: 액세스 키 수명 90일 이내
- `iam_root_access_key`: 루트 계정 액세스 키 없음
- `iam_root_mfa`: 루트 계정 MFA 활성화

### S3

- `s3_public_access`: S3 퍼블릭 액세스 차단
- `s3_encryption`: S3 기본 암호화 설정

### EC2

- `ec2_imdsv2`: EC2 메타데이터 서비스 IMDSv2 강제
- `ec2_public_ip`: EC2 퍼블릭 IP 할당 여부

## FastAPI vs Flask 장점

- **비동기 처리**: async/await로 동시 다중 점검 가능
- **자동 문서화**: Swagger UI (/docs), ReDoc (/redoc)
- **타입 검증**: Pydantic으로 자동 요청/응답 검증
- **성능**: ASGI 기반으로 더 빠른 처리
