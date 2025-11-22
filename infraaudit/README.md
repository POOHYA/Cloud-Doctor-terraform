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
│   │   ├── appstream_checks.py         # Appstream 보안 점검
│   │   ├── base_check.py               # 점검 베이스 클래스
│   │   ├── bedrock_checks.py           # Bedrock 보안 점검
│   │   ├── cloudformation_check.py     # Cloudformation 보안 점검
│   │   ├── cognito_check.py            # Cognito 보안 점검
│   │   ├── documentdb_check.py         # Documentdb 보안 점검
│   │   ├── ec2_checks.py               # EC2 보안 점검
│   │   ├── ecr_checks.py               # ECR 보안 점검
│   │   ├── eks_checks.py               # EKS 보안 점검
│   │   ├── elasticbeanstalk_check.py   # Elasticbeanstalk 보안 점검
│   │   ├── glue_check.py               # Glue 보안 점검
│   │   ├── guardduty_checks.py         # Guardduty 보안 점검
│   │   ├── iam_checks.py               # IAM 보안 점검
│   │   ├── kms_checks.py               # KMS 보안 점검
│   │   ├── opensearch_checks.py        # Opensearch 보안 점검
│   │   ├── organizations_check.py      # Organizations 보안 점검
│   │   ├── rds_check.py                # RDS 보안 점검
│   │   ├── redshift_checks.py          # Redshift 보안 점검
│   │   ├── s3_checks.py                # S3 보안 점검
│   │   ├── ses_checks.py               # SES 보안 점검
│   │   ├── sns_check.py                # SNS 보안 점검
│   │   ├── sqs_check.py                # SQS 보안 점검
│   │   └── ssm_checks.py               # SSM 보안 점검
│   └── models/
│       └── audit.py                # Pydantic 모델
└── tests/
```

## 설치 및 실행

### 1. 가상환경 생성 및 활성화

```bash
cd infraaudit
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate  # Windows
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 환경 변수 설정 (선택사항)

```bash
cp .env.example .env
# .env 파일 수정 (필요시)
```

### 4. 서버 실행

```bash
# 개발 모드 (자동 재시작)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 프로덕션 모드
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 5. HTTPS 실행 (로컬 개발용)

```bash
# mkcert로 인증서 생성 (최초 1회)
mkcert -install
mkcert localhost 127.0.0.1 ::1

# HTTPS로 실행
uvicorn main:app --reload --host 0.0.0.0 --port 8000 \
  --ssl-keyfile=./localhost-key.pem \
  --ssl-certfile=./localhost.pem
```

### 6. 접속 확인

- API 문서: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

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

## 사용자용 IAM

```json
Rolename: CloudDoctorAuditRole
신뢰정책
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::346448660196:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "<고객별-ExternalID>"
        }
      }
    }
  ]
}

권한정책
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudDoctorAuditPermissions",
      "Effect": "Allow",
      "Action": [
        "iam:GetAccountSummary",
        "iam:ListUsers",
        "iam:ListRoles",
        "iam:ListPolicies",
        "iam:ListAttachedUserPolicies",
        "iam:ListAttachedRolePolicies",
        "iam:GetPolicy",
        "iam:GetPolicyVersion",
        "ec2:Describe*",
        "s3:ListAllMyBuckets",
        "s3:GetBucketAcl",
        "s3:GetBucketPolicy",
        "kms:ListKeys",
        "kms:DescribeKey",
        "kms:GetKeyPolicy",
        "cloudtrail:DescribeTrails",
        "cloudtrail:GetEventSelectors",
        "cloudtrail:GetTrailStatus",
        "cloudformation:DescribeStacks",
        "rds:Describe*",
        "sns:ListTopics",
        "sns:GetTopicAttributes"
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
