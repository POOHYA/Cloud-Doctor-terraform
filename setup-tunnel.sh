#!/bin/bash

echo "🚀 Cloudflare Tunnel 설정 시작..."

# 백엔드 설정
echo "📦 백엔드 환경변수 설정..."
cd backend/CloudDoctorWeb
if [ -f .env.production ]; then
    cp .env.production .env
    echo "✅ .env.production을 .env로 복사 완료"
else
    sed -i '' 's/COOKIE_SECURE=false/COOKIE_SECURE=true/' .env
    echo "✅ COOKIE_SECURE=true로 변경 완료"
fi

# 프론트엔드 빌드
echo "🔨 프론트엔드 빌드 중..."
cd ../../frontend/cloud-doctor
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 프론트엔드 빌드 완료"
    echo ""
    echo "🎉 설정 완료!"
    echo ""
    echo "다음 명령어로 실행하세요:"
    echo "1. 백엔드: cd backend/CloudDoctorWeb && ./gradlew bootRun"
    echo "2. 프론트엔드: cd frontend/cloud-doctor && npx serve -s build -l 3001"
    echo "3. Cloudflare Tunnel: cloudflared tunnel run cloud-doctor"
    echo ""
    echo "접속 URL:"
    echo "- 프론트엔드: https://web.takustory.site"
    echo "- 백엔드: https://back.takustory.site"
else
    echo "❌ 프론트엔드 빌드 실패"
    exit 1
fi
