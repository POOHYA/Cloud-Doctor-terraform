# 관리자 권한 및 설정 가이드

## 0. 데이터베이스 초기화 (Flyway 에러 발생 시)

Flyway 마이그레이션 체크섬 불일치 또는 스키마 에러 발생 시 데이터베이스를 초기화합니다.

### 데이터베이스 스키마 초기화

```bash
# PostgreSQL 스키마 삭제 및 재생성
docker exec clouddoctor-postgres psql -U clouddoctor -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
NOTICE:  drop cascades to 11 other objects
DETAIL:  drop cascades to table flyway_schema_history
drop cascades to table users
drop cascades to table refresh_tokens
drop cascades to table cloud_providers
drop cascades to table service_lists
drop cascades to table guidelines
drop cascades to table guideline_solution_images
drop cascades to table guideline_links
drop cascades to table checklists
drop cascades to table user_checklist_results
drop cascades to table user_checklist_item_results
DROP SCHEMA
CREATE SCHEMA

# 또는 Docker 컨테이너 재시작
docker-compose down
docker-compose up -d
```

### 주의사항
- 이 명령어는 모든 데이터를 삭제합니다
- 개발 환경에서만 사용하세요
- 프로덕션 환경에서는 Flyway repair 명령 사용 권장

### Flyway Repair (대안)

```bash
# Flyway repair 명령 (체크섬만 수정)
./gradlew flywayRepair
```

---

## 1. 회원가입 후 관리자 권한 부여

일반 사용자로 회원가입 후, PostgreSQL에서 직접 관리자 권한을 부여합니다.

### SQL 명령어

```sql
-- 특정 사용자를 관리자로 변경
UPDATE users 
SET role = 'ADMIN' 
WHERE username = '사용자명';

-- 또는 이메일로 변경
UPDATE users 
SET role = 'ADMIN' 
WHERE email = '이메일@example.com';

-- 확인
SELECT id, username, email, role, is_active 
FROM users 
WHERE role = 'ADMIN';
```

## 2. 중복 로그인 차단 (선택사항)

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

## 3. Docker Compose 실행

```bash
# Docker 컨테이너 시작
docker-compose up -d

# PostgreSQL 접속
docker exec -it clouddoctor-postgres psql -U clouddoctor -d clouddoctor

# 관리자 권한 부여
UPDATE users SET role = 'ADMIN' WHERE username = 'admin';
```

## 4. 애플리케이션 실행

```bash
# 환경변수 설정 후 실행
source .env && ./gradlew bootRun

# 또는 IDE에서 VM Options 설정
-DPGSQL_URL=jdbc:postgresql://localhost:35432/clouddoctor
-DPGSQL_USERNAME=clouddoctor
-DPGSQL_PASSWORD=password123
-DREDIS_HOST=localhost
-DREDIS_PORT=36379
-DREDIS_PASSWORD=password123
```
