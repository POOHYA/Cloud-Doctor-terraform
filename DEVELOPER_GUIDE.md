# 개발자 가이드

## 로컬 개발 환경 설정

### 1. 백엔드 실행 (개발 모드)
```bash
cd backend/CloudDoctorWeb

# 개발 프로파일로 실행
./gradlew bootRun --args='--spring.profiles.active=dev'

# 또는 IDE에서 실행 시
# VM Options: -Dspring.profiles.active=dev
```

### 2. 프론트엔드 실행
```bash
cd frontend/cloud-doctor

# 환경변수 설정 (.env.local 파일 생성)
echo "REACT_APP_API_URL=http://localhost:9090" > .env.local

# 개발 서버 실행
npm start
```

### 3. 로컬 데이터베이스 설정

#### Docker로 PostgreSQL + Redis 실행
```bash
# docker-compose.yml 생성
cat > docker-compose.dev.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: clouddoctor
      POSTGRES_USER: clouddoctor
      POSTGRES_PASSWORD: clouddoctor
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
EOF

# 실행
docker-compose -f docker-compose.dev.yml up -d
```

## 환경별 설정

### 개발 환경 (application-dev.yml)
- **쿠키**: HTTP 허용 (secure: false)
- **CORS**: localhost:* 허용
- **JWT**: 긴 만료시간 (1-2시간)
- **로깅**: DEBUG 레벨

### 프로덕션 환경 (application-prod.yml)
- **쿠키**: HTTPS 필수 (secure: true)
- **CORS**: 특정 도메인만 허용
- **JWT**: 짧은 만료시간 (1-2분)
- **로깅**: INFO 레벨

## 로그인 문제 해결

### 문제: 다른 개발자가 로그인 안 됨
**원인**: 쿠키 도메인/보안 설정 차이

**해결방법**:
1. **개발 프로파일 사용**: `--spring.profiles.active=dev`
2. **브라우저 쿠키 확인**: 개발자 도구 > Application > Cookies
3. **CORS 에러 확인**: 브라우저 콘솔 확인

### 문제: CORS 에러 발생
**해결방법**:
```bash
# 프론트엔드 .env.local 확인
REACT_APP_API_URL=http://localhost:9090

# 백엔드 CORS 설정 확인 (SecurityConfig.java)
# localhost:* 패턴이 포함되어 있는지 확인
```

### 문제: 쿠키가 전달되지 않음
**해결방법**:
```javascript
// axios.ts에서 withCredentials 확인
withCredentials: true

// 개발 환경에서는 SameSite=Lax 사용
// 프로덕션에서는 SameSite=None + Secure 사용
```

## API 테스트

### Swagger UI 접속
- **개발**: http://localhost:9090/swagger-ui.html
- **프로덕션**: https://cloud-doctor.site/swagger-ui.html

### 수동 API 테스트
```bash
# 로그인
curl -X POST http://localhost:9090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -c cookies.txt

# 인증 필요 API 호출
curl -X GET http://localhost:9090/admin/services \
  -b cookies.txt
```

## 디버깅 팁

### 1. JWT 토큰 확인
```bash
# 브라우저 개발자 도구 > Application > Cookies
# accessToken, refreshToken 존재 확인
```

### 2. 백엔드 로그 확인
```bash
# JWT 필터 로그
grep "JWT 필터 처리" logs/app.log

# 토큰 검증 로그
grep "토큰 검증" logs/app.log
```

### 3. 네트워크 요청 확인
```bash
# 브라우저 개발자 도구 > Network
# 401/403 에러 응답 확인
# 쿠키 전달 여부 확인
```

## 팀 개발 규칙

### 1. 환경 분리
- **로컬 개발**: `dev` 프로파일 사용
- **테스트 서버**: `test` 프로파일 사용  
- **프로덕션**: `prod` 프로파일 사용

### 2. 설정 파일 관리
- **공통 설정**: `application.yml`
- **환경별 설정**: `application-{profile}.yml`
- **민감 정보**: 환경변수 사용

### 3. 데이터베이스
- **로컬**: Docker PostgreSQL + Redis
- **공유 개발**: AWS RDS + ElastiCache (개발용)
- **프로덕션**: AWS RDS + ElastiCache (프로덕션용)