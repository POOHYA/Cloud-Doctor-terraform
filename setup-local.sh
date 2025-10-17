#!/bin/bash

echo "🏠 로컬 개발 환경 설정 시작..."

# 백엔드 설정
echo "📦 백엔드 환경변수 설정..."
cd backend/CloudDoctorWeb
sed -i '' 's/COOKIE_SECURE=true/COOKIE_SECURE=false/' .env
echo "✅ COOKIE_SECURE=false로 변경 완료"

echo ""
echo "🎉 설정 완료!"
echo ""
echo "다음 명령어로 실행하세요:"
echo "1. 백엔드: cd backend/CloudDoctorWeb && ./gradlew bootRun"
echo "2. 프론트엔드: cd frontend/cloud-doctor && npm start"
echo ""
echo "접속 URL:"
echo "- 프론트엔드: http://localhost:3001"
echo "- 백엔드: http://localhost:9090"
