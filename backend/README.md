# Cloud Doctor Backend 개발 가이드

## 목차
- [시스템 구성](#시스템-구성)
- [환경 변수 설정](#환경-변수-설정)
- [개발 환경 구축](#개발-환경-구축)
- [데이터베이스 관리](#데이터베이스-관리)
- [관리자 권한 설정](#관리자-권한-설정)
- [중복 로그인 차단](#중복-로그인-차단)
- [트러블슈팅](#트러블슈팅)

## 시스템 구성

### 기술 스택
- **Java**: 21
- **Framework**: Spring Boot
- **Database**: PostgreSQL
- **Cache**: Redis
- **Migration**: Flyway
- **인증**: JWT (Access Token + Refresh Token)

### 주요 컴포넌트
- **포트**: 9090
- **데이터베이스 마이그레이션**: Flyway (자동)
- **타임존**: Asia/Seoul
- **외부 연동**: 인프라 점검 FastAPI 서비스

## 환경 변수 설정

### application.yml 기본 구성

```yaml
spring:
  application:
    name: CloudDoctorWeb
  datasource:
    url: ${PGSQL_URL}
    username: ${PGSQL_USERNAME}
    password: ${PGSQL_PASSWORD}
    driver-class-name: org.postgresql.Driver
  data:
    redis:
      port: ${REDIS_PORT}
      host: ${REDIS_HOST}
      password: ${REDIS_PASSWORD}
  jackson:
    serialization:
      write-dates-as-timestamps: false
    time-zone: Asia/Seoul
    date-format: yyyy-MM-dd HH:mm:ss

server:
  port: 9090

jwt:
  access-token-expiration: ${ACCESS_TOKEN_EXPIRATION}   # 밀리초
  refresh-token-expiration: ${REFRESH_TOKEN_EXPIRATION} # 밀리초

cookie:
  secure: ${COOKIE_SECURE}  # true: HTTPS only

infraaudit:
  api:
    url: ${INFRAAUDIT_API_URL}
```

### 필수 환경 변수

#### PostgreSQL 설정
```bash
PGSQL_URL=jdbc:postgresql://localhost:35432/clouddoctor
PGSQL_USERNAME=clouddoctor
PGSQL_PASSWORD=your_password
```

#### Redis 설정
```bash
REDIS_HOST=localhost
REDIS_PORT=36379
REDIS_PASSWORD=your_redis_password
```

#### JWT 토큰 설정
```bash
# 개발 환경
ACCESS_TOKEN_EXPIRATION=60000      # 1분
REFRESH_TOKEN_EXPIRATION=120000    # 2분

# 운영 환경
ACCESS_TOKEN_EXPIRATION=3600000    # 1시간
REFRESH_TOKEN_EXPIRATION=604800000 # 7일
```

#### 쿠키 및 API 설정
```bash
COOKIE_SECURE=false  # 개발: false, 운영: true

# 인프라 점검 API
INFRAAUDIT_API_URL=http://localhost:8000/api/v1  # 개발
INFRAAUDIT_API_URL=https://audit.cloud-doctor.site/api/v1  # 운영
```

## 개발 환경 구축

### 1. Docker Compose 실행

```bash
# Docker 컨테이너 시작
docker-compose up -d

# 컨테이너 상태 확인
docker-compose ps
```

### 2. 애플리케이션 실행

#### 방법 1: Gradle 실행
```bash
# 환경변수 파일 설정 후 실행
source .env && ./gradlew bootRun
```

#### 방법 2: IDE 실행 (IntelliJ IDEA)
VM Options에 다음 설정 추가:
```
-DPGSQL_URL=jdbc:postgresql://localhost:35432/clouddoctor
-DPGSQL_USERNAME=clouddoctor
-DPGSQL_PASSWORD=password123
-DREDIS_HOST=localhost
-DREDIS_PORT=36379
-DREDIS_PASSWORD=password123
-DACCESS_TOKEN_EXPIRATION=60000
-DREFRESH_TOKEN_EXPIRATION=120000
-DCOOKIE_SECURE=false
-DINFRAAUDIT_API_URL=http://localhost:8000/api/v1
```

### 3. 애플리케이션 접속
```
http://localhost:9090
```

## 데이터베이스 관리

### PostgreSQL 접속

```bash
# Docker를 통한 PostgreSQL 접속
docker exec -it clouddoctor-postgres psql -U clouddoctor -d clouddoctor
```

### Flyway 마이그레이션

마이그레이션은 애플리케이션 시작 시 자동으로 실행됩니다.

```yaml
flyway:
  enabled: true
  locations: classpath:db/migration
```

## 관리자 권한 설정

### 1. 회원가입
일반 사용자로 회원가입을 진행합니다.

### 2. 관리자 권한 부여

#### PostgreSQL에서 직접 변경
```sql
-- 사용자명으로 검색하여 관리자 권한 부여
UPDATE users 
SET role = 'ADMIN' 
WHERE username = '사용자아이디';

-- 이메일로 검색하여 관리자 권한 부여
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'user@example.com';

-- 관리자 목록 확인
SELECT id, username, email, role, is_active, created_at
FROM users 
WHERE role = 'ADMIN';
```

#### Docker를 통한 실행
```bash
# PostgreSQL 접속
docker exec -it clouddoctor-postgres psql -U clouddoctor -d clouddoctor

# SQL 실행
UPDATE users SET role = 'ADMIN' WHERE username = 'admin';

# 종료
\q
```

## 중복 로그인 차단

`is_active`와 `last_login` 필드를 활용하여 중복 로그인을 차단할 수 있습니다.

### 구현 방법
1. 로그인 시 `last_login` 업데이트
2. 새로운 로그인 시도 시 기존 세션 무효화
3. Redis에 저장된 액세스 토큰 삭제

### 예시 코드 (AuthServiceImpl)

```java
@Override
public TokenResponse login(LoginRequest loginRequest, String userAgent) {
    User user = userRepository.findByUsername(loginRequest.getUsername())
        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
    
    if (!user.getIsActive()) {
        throw new RuntimeException("비활성화된 계정입니다");
    }
    
    if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
        throw new RuntimeException("비밀번호가 일치하지 않습니다");
    }
    
    // 기존 토큰 무효화 (중복 로그인 차단)
    jwtService.removeAccessToken(user.getUsername());
    
    // 마지막 로그인 시간 업데이트
    user.setLastLogin(LocalDateTime.now());
    userRepository.save(user);
    
    String accessToken = jwtService.generateAccessToken(user, userAgent);
    String refreshToken = jwtService.generateRefreshToken(user);
    
    log.info("로그인 성공: {}", user.getUsername());
    return new TokenResponse(accessToken, refreshToken);
}
```

## 트러블슈팅

### Flyway 마이그레이션 에러

Flyway 체크섬 불일치 또는 스키마 에러 발생 시 다음 방법을 시도합니다.

#### 방법 1: 데이터베이스 스키마 초기화 (개발 환경)

```bash
# PostgreSQL 스키마 삭제 및 재생성
docker exec clouddoctor-postgres psql -U clouddoctor -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

실행 결과:
```
NOTICE:  drop cascades to 11 other objects
DETAIL:  drop cascades to table flyway_schema_history
        drop cascades to table users
        drop cascades to table refresh_tokens
        ...
DROP SCHEMA
CREATE SCHEMA
```

#### 방법 2: Docker 컨테이너 재시작

```bash
docker-compose down
docker-compose up -d
```

#### 방법 3: Flyway Repair (운영 환경 권장)

```bash
# 체크섬만 수정
./gradlew flywayRepair
```

### 주의사항

- **데이터베이스 초기화는 모든 데이터를 삭제합니다**
- 개발 환경에서만 사용하세요
- 운영 환경에서는 Flyway repair 명령 사용을 권장합니다
- 데이터 백업 후 작업하세요

### 일반적인 문제 해결

#### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :9090
lsof -i :35432
lsof -i :36379

# 프로세스 종료
kill -9 <PID>
```

#### Redis 연결 오류
```bash
# Redis 상태 확인
docker exec -it clouddoctor-redis redis-cli
AUTH your_redis_password
PING
```

#### PostgreSQL 연결 오류
```bash
# 컨테이너 로그 확인
docker logs clouddoctor-postgres

# 연결 테스트
docker exec -it clouddoctor-postgres psql -U clouddoctor -d clouddoctor -c "SELECT 1;"
```

## 추가 리소스

- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [Flyway 마이그레이션 가이드](https://flywaydb.org/documentation/)
- [JWT 인증 Best Practices](https://tools.ietf.org/html/rfc8725)

## 라이선스

이 프로젝트는 [라이선스 명시]에 따라 라이선스가 부여됩니다.
