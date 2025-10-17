pipeline {
    agent any
    
    environment {
        DB_PASSWORD = credentials('clouddoctor-db-password')
        AWS_REGION = 'ap-northeast-2'
        REACT_APP_API_URL = 'https://cloud-doctor.site'
    }
    
    tools {
        jdk 'JDK-17'
        nodejs '18'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Parallel Build') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend/CloudDoctorWeb') {
                            sh '''
                                chmod +x gradlew
                                ./gradlew clean build -x test
                            '''
                        }
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        dir('frontend/cloud-doctor') {
                            sh '''
                                npm ci
                                npm run build
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Parallel Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend/CloudDoctorWeb') {
                            sh './gradlew test'
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'backend/CloudDoctorWeb/build/test-results/test/*.xml'
                        }
                    }
                }
                
                stage('Frontend Tests') {
                    steps {
                        dir('frontend/cloud-doctor') {
                            sh 'npm test -- --coverage --watchAll=false'
                        }
                    }
                }
            }
        }
        
        stage('Stop Services') {
            steps {
                sh '''
                    # 기존 서비스 종료
                    pkill -f "clouddoctor.*jar" || true
                    sleep 5
                '''
            }
        }
        
        stage('Deploy Backend') {
            steps {
                dir('backend/CloudDoctorWeb') {
                    sh '''
                        # JAR 파일 배포
                        sudo mkdir -p /opt/clouddoctor
                        sudo cp build/libs/*.jar /opt/clouddoctor/clouddoctor.jar
                        
                        # 백엔드 시작
                        nohup java -jar \
                            -Dspring.profiles.active=prod \
                            -Dserver.port=9090 \
                            -Dspring.datasource.password=${DB_PASSWORD} \
                            /opt/clouddoctor/clouddoctor.jar > /opt/clouddoctor/app.log 2>&1 &
                        
                        # 백엔드 헬스체크
                        sleep 30
                        curl -f http://localhost:9090/health || exit 1
                    '''
                }
            }
        }
        
        stage('Deploy Frontend') {
            steps {
                dir('frontend/cloud-doctor') {
                    sh '''
                        # Spring Boot static 폴더에 프론트엔드 배포
                        sudo mkdir -p /opt/clouddoctor/static
                        sudo cp -r build/* /opt/clouddoctor/static/
                        
                        echo "Frontend deployed to Spring Boot static folder"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Full stack deployment successful!'
            // Slack 알림 등 추가 가능
        }
        failure {
            echo 'Deployment failed!'
            // 롤백 로직 추가 가능
        }
    }
}