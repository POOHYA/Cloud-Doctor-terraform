# Cloud Doctor 빠른 시작 가이드

## 터널링 환경 (https://web.takustory.site)

### 1단계: 자동 설정 실행
```bash
./setup-tunnel.sh
```

### 2단계: 서버 실행

**터미널 1 - 백엔드**
```bash
cd backend/CloudDoctorWeb
./gradlew bootRun
```

**터미널 2 - 프론트엔드**
```bash
cd frontend/cloud-doctor
npx serve -s build -l 3001
```

**터미널 3 - Cloudflare Tunnel**
```bash
cloudflared tunnel run cloud-doctor
```

### 접속
- 프론트엔드: https://web.takustory.site
- 백엔드 API: https://back.takustory.site

---

## 로컬 개발 환경 (http://localhost:3001)

### 1단계: 자동 설정 실행
```bash
./setup-local.sh
```

### 2단계: 서버 실행

**터미널 1 - 백엔드**
```bash
cd backend/CloudDoctorWeb
./gradlew bootRun
```

**터미널 2 - 프론트엔드**
```bash
cd frontend/cloud-doctor
npm start
```

### 접속
- 프론트엔드: http://localhost:3001
- 백엔드 API: http://localhost:9090

---

## 수동 설정 (필요시)

### 터널링 환경
1. 백엔드 `.env` 파일에서 `COOKIE_SECURE=true` 설정
2. 프론트엔드 빌드: `cd frontend/cloud-doctor && npm run build`
3. 서버 실행 (위 2단계 참고)

### 로컬 환경
1. 백엔드 `.env` 파일에서 `COOKIE_SECURE=false` 설정
2. 프론트엔드 개발 모드: `cd frontend/cloud-doctor && npm start`

---

## 환경 전환

### 터널링 → 로컬
```bash
./setup-local.sh
```

### 로컬 → 터널링
```bash
./setup-tunnel.sh
```

---

## 문제 해결

### 쿠키가 전송되지 않음
- 백엔드 `.env`에서 `COOKIE_SECURE` 값 확인
- 터널링: `true`, 로컬: `false`

### API 호출 실패
- 프론트엔드 `.env.production` 확인: `REACT_APP_API_URL=https://back.takustory.site`
- 프론트엔드 재빌드: `npm run build`

### 로그인 후 헤더 업데이트 안됨
- 브라우저 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)
- 브라우저 캐시 삭제
