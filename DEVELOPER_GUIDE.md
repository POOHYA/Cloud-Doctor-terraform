# Cloud Doctor 개발 환경 구축 가이드

## 목차
- [시스템 구성](#시스템-구성)
- [환경 변수 설정](#환경-변수-설정)
- [로컬 개발 환경 설정](#로컬-개발-환경-설정)
- [서버별 개발 환경](#서버별-개발-환경)

## 시스템 구성

Cloud Doctor는 다음 3개의 주요 컴포넌트로 구성됩니다:

- **백엔드**: Spring Boot 애플리케이션 (포트: 9090)
- **프론트엔드**: React 애플리케이션
- **인프라 점검 서비스**: AWS 인프라 보안 점검용 FastAPI 서비스

## 환경 변수 설정

### 1. 백엔드 (Spring Boot)

#### 데이터베이스 (PostgreSQL)
```yaml
PGSQL_URL=jdbc:postgresql://db:5432/clouddoctor
PGSQL_USERNAME=clouddoctor_app
PGSQL_PASSWORD=your_password
```

#### Redis
```yaml
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

#### JWT 토큰 설정
```yaml
ACCESS_TOKEN_EXPIRATION=3600000    # 1시간 (밀리초)
REFRESH_TOKEN_EXPIRATION=604800000 # 7일 (밀리초)
```

#### 쿠키 보안
```yaml
COOKIE_SECURE=true  # 운영 환경에서 권장
```

#### 인프라 점검 API 연동
```yaml
# 개발 환경
INFRAAUDIT_API_URL=http://infra-audit:8000/api/v1

# 운영 환경
INFRAAUDIT_API_URL=https://audit.cloud-doctor.site/api/v1
```

### 2. 프론트엔드 (React)

#### API 엔드포인트
```bash
# 백엔드 API
REACT_APP_API_URL=https://api.cloud-doctor.site        # 운영
REACT_APP_API_URL=https://localhost:9000                # 로컬

# 인프라 점검 API
REACT_APP_AUDIT_API_URL=https://audit.cloud-doctor.site # 운영
REACT_APP_AUDIT_API_URL=https://localhost:8000          # 로컬
```

#### 로컬 개발 설정 (선택)
```bash
HTTPS=true
SSL_CRT_FILE=./localhost.pem
SSL_KEY_FILE=./localhost-key.pem
HOST=localhost
PORT=3000
```

### 3. 인프라 점검 서비스 (FastAPI)

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=ap-northeast-2
API_SECRET_KEY=your_api_secret_key
```

### 4. 배포 환경 변수

```bash
# Bastion Host
BASTION_PUBLIC_IP=your_bastion_ip
BASTION_SSH_KEY=your_bastion_private_key

# EC2 배포
EC2_HOST=your_ec2_host
EC2_SSH_KEY=your_ec2_private_key

# Private IP
PRIVATE_IP=backend_private_ip
FRONTEND_PRIVATE_IP=frontend_private_ip
PYTHON_PRIVATE_IP=python_service_private_ip
```

### GitHub Actions 환경 변수 설정 예시

```yaml
env:
  # Backend
  PGSQL_URL: ${{ secrets.PGSQL_URL }}
  PGSQL_USERNAME: ${{ secrets.PGSQL_USERNAME }}
  PGSQL_PASSWORD: ${{ secrets.PGSQL_PASSWORD }}
  REDIS_HOST: ${{ secrets.REDIS_HOST }}
  REDIS_PORT: ${{ secrets.REDIS_PORT }}
  REDIS_PASSWORD: ${{ secrets.REDIS_PASSWORD }}
  ACCESS_TOKEN_EXPIRATION: ${{ secrets.ACCESS_TOKEN_EXPIRATION }}
  REFRESH_TOKEN_EXPIRATION: ${{ secrets.REFRESH_TOKEN_EXPIRATION }}
  COOKIE_SECURE: ${{ secrets.COOKIE_SECURE }}
  INFRAAUDIT_API_URL: ${{ secrets.INFRAAUDIT_API_URL }}
  
  # AWS
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  AWS_DEFAULT_REGION: ${{ secrets.AWS_DEFAULT_REGION }}
  
  # Frontend
  REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
  REACT_APP_AUDIT_API_URL: ${{ secrets.REACT_APP_AUDIT_API_URL }}
  
  # Python Service
  API_SECRET_KEY: ${{ secrets.API_SECRET_KEY }}
  
  # Deployment
  BASTION_PUBLIC_IP: ${{ secrets.BASTION_PUBLIC_IP }}
  BASTION_SSH_KEY: ${{ secrets.BASTION_SSH_KEY }}
  EC2_HOST: ${{ secrets.EC2_HOST }}
  EC2_SSH_KEY: ${{ secrets.EC2_SSH_KEY }}
  PRIVATE_IP: ${{ secrets.PRIVATE_IP }}
  FRONTEND_PRIVATE_IP: ${{ secrets.FRONTEND_PRIVATE_IP }}
  PYTHON_PRIVATE_IP: ${{ secrets.PYTHON_PRIVATE_IP }}
```

## 로컬 개발 환경 설정

### SSL 인증서 설정 (mkcert)

로컬 개발 환경에서 HTTPS와 쿠키 처리를 위해 mkcert를 사용합니다.

#### 1. mkcert 설치

**macOS:**
```bash
brew install mkcert
```

**Windows:**
```bash
choco install mkcert
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install libnss3-tools
wget -O mkcert https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-v*-linux-amd64
chmod +x mkcert
sudo mv mkcert /usr/local/bin/
```

#### 2. 로컬 CA 설치
```bash
mkcert -install
```

#### 3. localhost 인증서 생성
```bash
# 프로젝트 루트에서 실행
mkcert localhost 127.0.0.1 ::1
```

#### 4. 프론트엔드 개발 서버 실행
```bash
cd frontend/cloud-doctor
npm install
npm run start:https
```

이제 https://localhost:3001 에서 접속 가능하며, 백엔드와의 쿠키 처리가 정상적으로 작동합니다.

### 주의사항

- 다른 개발자는 각자의 환경에서 mkcert 설치 및 설정이 필요합니다
- 인증서 파일(localhost.pem, localhost-key.pem)은 이미 프로젝트에 포함되어 있습니다
- 프로덕션 환경에서는 실제 SSL 인증서를 사용해야 합니다

## 서버별 개발 환경

### 프론트엔드 (React + TypeScript)

#### 필수 사항
- Node.js 18 이상
- npm 또는 yarn
- mkcert를 통한 로컬 SSL 인증서 설정

#### 선택 사항
- VS Code + ESLint, Prettier 확장 프로그램
- React Developer Tools

### 백엔드 (Spring Boot)

**요구사항:** Java 21

#### 필수 사항
- Java 21 JDK
- PostgreSQL 클라이언트 접근 권한
- Redis 접근 권한
- 개발 환경 HTTPS 인증 설정

#### 선택 사항
- IntelliJ IDEA
- Spring Boot DevTools
- Lombok 플러그인

### 인프라 점검 서비스 (FastAPI)

**요구사항:** Python 3.11

#### 필수 사항
- Python 3.11
- pip 패키지 관리자
- AWS CLI 설정
- boto3 라이브러리

#### 선택 사항
- PyCharm
- virtualenv 또는 conda
- uvicorn (ASGI 서버)

## 라이선스

이 프로젝트는 [라이선스 명시]에 따라 라이선스가 부여됩니다.

## 기여

기여 가이드라인은 CONTRIBUTING.md를 참조하세요.
