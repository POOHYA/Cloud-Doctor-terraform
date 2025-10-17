# Cloud Doctor 배포 가이드

## 로컬 개발 환경

### 백엔드
```bash
cd backend/CloudDoctorWeb
# .env 파일 사용 (COOKIE_SECURE=false)
./gradlew bootRun
```

### 프론트엔드
```bash
cd frontend/cloud-doctor
# .env 파일 사용 (REACT_APP_API_URL=http://localhost:9090)
npm start
```

## 터널 환경 (Cloudflare Tunnel)

### 백엔드
```bash
cd backend/CloudDoctorWeb
# .env.production 파일을 .env로 복사 (COOKIE_SECURE=true)
cp .env.production .env
./gradlew bootRun
```

### 프론트엔드
```bash
cd frontend/cloud-doctor
# 프로덕션 빌드 (자동으로 .env.production 사용)
npm run build
# 빌드된 파일을 서빙
npx serve -s build -l 3001
```

### Cloudflare Tunnel 설정
- 프론트엔드: https://web.takustory.site → localhost:3001
- 백엔드: https://back.takustory.site → localhost:9090

## 환경변수 설정

### 백엔드 (.env)
- `COOKIE_SECURE=false` - 로컬 HTTP 환경
- `COOKIE_SECURE=true` - 터널 HTTPS 환경

### 프론트엔드
- `.env` - 로컬 개발용 (http://localhost:9090)
- `.env.production` - 터널 프로덕션용 (https://back.takustory.site)

## 체크리스트 저장 기능

1. 체크리스트 페이지에서 항목 체크
2. 하단에 제목 입력
3. "저장" 버튼 클릭
4. 마이페이지에서 저장된 체크리스트 확인 (시간 포함)
