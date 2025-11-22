# 베이스 이미지
FROM python:3.11-slim

# 작업 디렉토리 생성
WORKDIR /app

# 의존성 파일 복사
COPY requirements.txt .

# 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt

# 앱 소스 코드 복사
COPY . .

# 환경 변수 설정 (필요 시 runtime에서 덮어쓰기 가능)
ENV AWS_ACCESS_KEY_ID=""
ENV AWS_SECRET_ACCESS_KEY=""
ENV AWS_DEFAULT_REGION="ap-northeast-2"

# 포트
EXPOSE 8000

# 컨테이너 시작 명령
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]