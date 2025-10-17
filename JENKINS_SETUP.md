# Jenkins 설정 가이드

## Jenkins 설치 (EC2 App 서버에서)

### 1. Jenkins 설치
```bash
# Java 17 설치
sudo yum update -y
sudo yum install java-17-amazon-corretto -y

# Jenkins 설치
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
sudo yum install jenkins -y

# Jenkins 시작
sudo systemctl enable jenkins
sudo systemctl start jenkins

# 초기 비밀번호 확인
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 2. 필수 플러그인 설치
- **Git Plugin**: Git 저장소 연동
- **Pipeline Plugin**: 파이프라인 지원
- **NodeJS Plugin**: Node.js 환경
- **Gradle Plugin**: Gradle 빌드
- **Credentials Plugin**: 비밀번호 관리
- **HTML Publisher Plugin**: 테스트 리포트

### 3. 도구 설정 (Manage Jenkins > Tools)

#### JDK 설정
- Name: `JDK-17`
- JAVA_HOME: `/usr/lib/jvm/java-17-amazon-corretto`

#### NodeJS 설정
- Name: `18`
- Version: `NodeJS 18.x`

#### Git 설정
- Name: `Default`
- Path: `/usr/bin/git`

### 4. Credentials 설정

#### DB 비밀번호
- Kind: `Secret text`
- ID: `clouddoctor-db-password`
- Secret: `your_db_password`

#### GitHub 토큰 (Private 저장소인 경우)
- Kind: `Username with password`
- ID: `github-token`
- Username: `your_github_username`
- Password: `your_github_token`

## 파이프라인 Job 생성

### 1. 통합 배포 Job (추천)
- **Job Type**: Pipeline
- **Pipeline Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: `https://github.com/your-repo/Cloud-Doctor.git`
- **Script Path**: `Jenkinsfile`

### 2. 개별 배포 Job
#### Backend Job
- **Script Path**: `backend/CloudDoctorWeb/Jenkinsfile`

#### Frontend Job  
- **Script Path**: `frontend/cloud-doctor/Jenkinsfile`

## 환경 변수 설정

### Jenkins 시스템 환경변수
```bash
# /etc/environment 또는 Jenkins 설정에서
DB_PASSWORD=your_secure_password
AWS_REGION=ap-northeast-2
REACT_APP_API_URL=https://cloud-doctor.site
```

### Application.yml 프로덕션 설정
```yaml
# backend/CloudDoctorWeb/src/main/resources/application-prod.yml
spring:
  profiles:
    active: prod
  datasource:
    url: jdbc:postgresql://your-rds-endpoint:5432/clouddoctor
    username: clouddoctor
    password: ${DB_PASSWORD}
  data:
    redis:
      host: your-elasticache-endpoint
      port: 6379

server:
  port: 9090

aws:
  s3:
    bucket: your-s3-bucket-name
    region: ap-northeast-2
```

## 배포 플로우

### 자동 배포 (Webhook)
1. **GitHub Webhook 설정**
   - Payload URL: `http://your-jenkins-url/github-webhook/`
   - Content type: `application/json`
   - Events: `Push events`

2. **Jenkins Job 트리거 설정**
   - Build Triggers: `GitHub hook trigger for GITScm polling`

### 수동 배포
1. Jenkins 대시보드 접속
2. Job 선택 → `Build Now`
3. Console Output으로 진행상황 확인

## 모니터링

### 로그 확인
```bash
# Jenkins 로그
sudo tail -f /var/log/jenkins/jenkins.log

# 애플리케이션 로그
tail -f /opt/clouddoctor/app.log

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 헬스체크
```bash
# 백엔드 헬스체크
curl http://localhost:9090/health

# 프론트엔드 헬스체크  
curl http://localhost/

# 전체 서비스 상태
systemctl status jenkins nginx
```

## 트러블슈팅

### 일반적인 문제
1. **포트 충돌**: Jenkins(8080), Backend(9090), Frontend(80) 확인
2. **권한 문제**: Jenkins 사용자에게 sudo 권한 부여 필요
3. **메모리 부족**: t3.medium 이상 권장
4. **방화벽**: Security Group에서 포트 허용 확인

### Jenkins 사용자 sudo 권한 부여
```bash
sudo visudo
# 다음 라인 추가
jenkins ALL=(ALL) NOPASSWD: ALL
```