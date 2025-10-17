# Cloudflare Tunnel 설정 가이드

## 1. 백엔드 설정

터널 사용 시 `.env` 파일의 `COOKIE_SECURE`를 `true`로 변경:

```bash
cd backend/CloudDoctorWeb
# .env 파일 수정
COOKIE_SECURE=true
```

또는 `.env.production`을 `.env`로 복사:
```bash
cp .env.production .env
```

백엔드 실행:
```bash
./gradlew bootRun
```

## 2. 프론트엔드 빌드

```bash
cd frontend/cloud-doctor
# 프로덕션 빌드 (자동으로 .env.production 사용)
npm run build
```

빌드된 파일 서빙:
```bash
# 포트 3001에서 서빙
npx serve -s build -l 3001
```

## 3. Cloudflare Tunnel 설정

### 터널 생성 및 설정
```bash
cloudflared tunnel create cloud-doctor
```

### config.yml 설정 예시
```yaml
tunnel: <TUNNEL_ID>
credentials-file: /path/to/credentials.json

ingress:
  - hostname: web.takustory.site
    service: http://localhost:3001
  - hostname: back.takustory.site
    service: http://localhost:9090
  - service: http_status:404
```

### 터널 실행
```bash
cloudflared tunnel run cloud-doctor
```

## 4. DNS 설정

Cloudflare DNS에 CNAME 레코드 추가:
- `web.takustory.site` → `<TUNNEL_ID>.cfargotunnel.com`
- `back.takustory.site` → `<TUNNEL_ID>.cfargotunnel.com`

## 5. 확인

- 프론트엔드: https://web.takustory.site
- 백엔드: https://back.takustory.site/swagger-ui.html

## 로컬 개발로 돌아가기

```bash
# 백엔드
cd backend/CloudDoctorWeb
cp .env.local .env  # 또는 COOKIE_SECURE=false로 수정

# 프론트엔드
cd frontend/cloud-doctor
npm start  # 개발 모드 (자동으로 .env 사용)
```

## 트러블슈팅

### 쿠키가 전송되지 않는 경우
- 백엔드 `.env`에서 `COOKIE_SECURE=true` 확인
- CORS 설정에 `https://web.takustory.site` 포함 확인
- 브라우저 개발자 도구 > Application > Cookies 확인

### API 호출 실패
- 프론트엔드 `.env.production`에 `REACT_APP_API_URL=https://back.takustory.site` 확인
- 프론트엔드 재빌드: `npm run build`
- 백엔드 CORS 설정 확인
