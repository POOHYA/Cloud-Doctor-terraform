import React, { useState } from "react";

type ChecklistItem = {
  id: string;
  service: string;
  name: string;
};

const checklist: ChecklistItem[] = [
// IAM
{ id: "1.1", service: "IAM", name: "인스턴스 최소권한 IAM 역할만 할당" },
{ id: "1.2", service: "IAM", name: "액세스 키 수명 90일 이내" },
{ id: "1.3", service: "IAM", name: "IAM 사용자/그룹에 sts:AssumeRole 또는 sts:* 미할당" },
{ id: "1.4", service: "IAM", name: "자격증명 안전 관리(코드/저장소/환경변수 미포함과 Secrets Manager, 최소권한)" },
{ id: "1.5", service: "IAM", name: "IAM 사용자/그룹에 iam:CreateAccessKey 미할당" },
{ id: "1.6", service: "IAM", name: "IAM 사용자/그룹에 iam:UpdateAssumeRolePolicy와 sts:AssumeRole 미할당" },
{ id: "1.7", service: "IAM", name: "IAM 정책에 \":*\" administrative 권한 미할당" },
{ id: "1.8", service: "IAM", name: "루트 계정 액세스 키 없음" },
{ id: "1.9", service: "IAM", name: '콘솔 사용자 비밀번호 사용 시 MFA 활성화("password_enabled"와 "mfa_active"가 "True")' },
{ id: "1.10", service: "IAM", name: "IAM 사용자/그룹에 iam:AttachUserPolicy 미할당" },
{ id: "1.11", service: "IAM", name: "IAM Access Analyzer 모든 리전 활성화" },
{ id: "1.12", service: "IAM", name: "미사용 자격증명 90일 이내" },
{ id: "1.13", service: "IAM", name: "IAM 사용자/그룹에 iam:PassRole와 ec2:RunInstances 미할당" },
{ id: "1.14", service: "IAM", name: "IAM 사용자/그룹에 lambda:UpdateFunctionCode 미할당" },
{ id: "1.15", service: "IAM", name: "IAM 사용자/그룹에 iam:PassRole와 ec2:RunInstances 권한 미할당" },
{ id: "1.16", service: "IAM", name: "콘솔 접근 권한이 부여된 사용자가 지난 90일 이내 접속 또는 액세스 키를 생성한 후 90일 이내 사용" },
{ id: "1.17", service: "IAM", name: "IAM 신뢰 정책 최소화(불필요한 연합 인증 차단)" },
{ id: "1.18", service: "S3", name: "S3 파괴권한 제한과 버전관리/Object Lock/CloudTrail 모니터링" },
{ id: "1.19", service: "IAM", name: "IAM 사용자/그룹에 iam:AttachRolePolicy와 sts:AssumeRole 미할당" },
{ id: "1.20", service: "IAM", name: "루트 계정 MFA 활성화" },
{ id: "1.21", service: "IAM", name: "IAM 사용자/그룹에 iam:PassRole와 glue:CreateDevEndpoint 미할당" },
{ id: "1.22", service: "IAM", name: "IAM 사용자/그룹에 iam:PutUserPolicy 미할당" },
{ id: "1.23", service: "IAM", name: "IAM 자격증명에 할당된 인라인 정책에 kms:ReEncryptFrom와 kms:Decrypt 권한 동시 미할당" },
{ id: "1.24", service: "IAM", name: "IAM 사용자/그룹에 iam:PutRolePolicy와 sts:AssumeRole 미허용" },
{ id: "1.25", service: "IAM", name: "IAM 사용자/그룹에 iam:SetDefaultPolicyVersion 권한 미할당" },
{ id: "1.26", service: "IAM", name: "IAM 사용자/그룹에 iam:PassRole과 lambda:CreateFunction과 lambda:CreateEventSourceMapping 미할당" },
{ id: "1.27", service: "IAM", name: "IAM 사용자/그룹에 glue:UpdateDevEndpoint 미할당" },
{ id: "1.28", service: "IAM", name: "IAM 사용자/그룹에 iam:PassRole과 cloudformation:CreateStack 권한 미할당" },
{ id: "1.29", service: "Cognito", name: "Cognito Identity Pool 역할 최소권한(클라이언트 발급 임시자격 증권 제한)" },
{ id: "1.30", service: "Cognito", name: "Cognito Self-Sign-Up 통제(계정 열거 방지 정책 적용)" },
{ id: "1.31", service: "Cognito", name: "Cognito 토큰/사용자 속성 서버측 검증 강화(권한 상승/속성 조작 차단)" },
{ id: "1.32", service: "Cognito", name: "이메일 속성 검증 강제(email_verified 활용과 대소문자 취급 오류 차단)" },
{ id: "1.33", service: "Codestar", name: "비관리자의 codestar:CreateProject 권한 제한" },
{ id: "1.34", service: "Organizations", name: "Organizations Trusted Access 최소화(필요 서비스만 제한적으로 활성)" },
{ id: "1.35", service: "Organizations", name: "Organizations SCP 적용(고위험 API 차단/가드레일 강제)" },
{ id: "1.36", service: "SES", name: "SES 토큰 수명/회전/권한 최소화(외부 유출 방지)" },
{ id: "1.37", service: "SSM", name: "SSM 원격명령 통제(StartSession/SendCommand 최소권한/세션 로깅)" },
{ id: "1.38", service: "SSM", name: "SSM 문서 비공개 기본(매개변수 사용과 민감정보 금지, 공개 생성 차단)" },
{ id: "1.39", service: "SQS", name: "SQS 큐 정책 최소권한(전송·수신 역할 제한과 메시지 위·변조 방지)" },
// EC2
{ id: "2.1", service: "EC2", name: "EC2 메타데이터 서비스 IMDSv2 강제" },
{ id: "2.2", service: "EC2", name: "인터넷 불필요 EC2 퍼블릭 IP 미할당" },
{ id: "2.3", service: "EKS", name: "EKS API 엔드포인트 Private 또는 허용 CIDR 제한" },
{ id: "2.4", service: "EKS", name: "EKS 파라미터 endpointPublicAccess=false / endpointPrivateAccess=true publicAccessCidrs=CIDR 주소 범위 지정" },
{ id: "2.5", service: "Lambda", name: "Lambda 보안(환경변수 민감정보 금지와 함수 URL 인증 강제, 실행/역할 최소권한)" },
{ id: "2.6", service: "EC2", name: "EC2 User-Data 보안(민감정보 금지와 수정 권한 최소화, 부팅 시 실행 내용 검증)" },
{ id: "2.7", service: "AMI", name: "AMI 보안 공개 금지(퍼블릭 전환 금지와 이미지 하드닝/민감정보 제거)" },
{ id: "2.8", service: "AMI", name: "신뢰된 최신 AMI만 사용" },
{ id: "2.9", service: "AMI", name: "AMI 선택 검증(owner 지정/검증과 most_recent 자동선택 오용 방지)" },
{ id: "2.10", service: "ECR", name: "ECR 리포지토리 최소권한(와일드카드 금지와 Push/Pull 분리·감사)" },
{ id: "2.11", service: "CLI", name: "아웃바운드/CLI 남용 통제 조치" },
// S3
{ id: "3.1", service: "S3", name: "S3 퍼블릭 액세스 차단(계정/버킷) 활성화" },
{ id: "3.2", service: "EBS", name: "EBS 스냅샷 Private으로 설정" },
{ id: "3.3", service: "S3", name: "S3 기본 암호화 SSE-S3 또는 SSE-KMS로 설정" },
{ id: "3.4", service: "S3", name: "S3 버킷 정책 설정 및 정책에 따른 액세스 관리" },
{ id: "3.5", service: "S3", name: "S3 버킷 교차 리전 복제(CRR) 활성화" },
{ id: "3.6", service: "CloudTrail", name: "CloudTrail 데이터 이벤트(Write) 로깅 활성화" },
{ id: "3.7", service: "S3", name: "S3 접근 최소권한/비밀관리 강화(타사 취약점 연계 키 유출 대비)" },
{ id: "3.8", service: "S3", name: "S3 ACL 편집 권한 통제(ACL 변경 모니터링/알림)" },
// Security groups / VPC
{ id: "4.1", service: "VPC", name: "보안 그룹 인바운드 트래픽 제어 설정" },
{ id: "4.2", service: "VPC", name: '보안 그룹에 "소스 : 0.0.0.0/0, 포트 범위 : 3306"인 규칙이 미포함' },
{ id: "4.3", service: "VPC", name: "VPC Flow Logs 활성화" },
{ id: "4.4", service: "VPC", name: '보안 그룹에 "소스 : 0.0.0.0/0, 프로토콜 : TCP, 포트 범위 : 22 또는 3389"인 규칙이 미포함' },
{ id: "4.5", service: "VPC", name: '보안 그룹에 "소스 : 0.0.0.0/0, 포트 범위 : 9200, 9300 또는 5601"인 규칙이 미포함' },
{ id: "4.6", service: "DNS", name: "삭제 리소스 연계 DNS 정리(Dangling CNAME/CloudFront 제거와 서브도메인 하이재킹 방지)" },
// RDS
{ id: "5.1", service: "RDS", name: 'RDS 스냅샷 "DB 스냅샷 가시성" Private 설정' },
// SNS / Service Catalog
{ id: "6.1", service: "SNS", name: "SNS 주제 정책 게시/구독 대상 소유자 또는 지정된 계정만으로 설정" },
{ id: "6.2", service: "ServiceCatalog", name: "Service Catalog 권한 분리/관리자 자격 증명 보호(오용 모니터링)" },
{ id: "6.3", service: "SNS", name: "SNS 서명 검증 엄격화(SigningCertUrl 호스트/경로/체인 검증)" },
// Elastic Beanstalk / Amplify / CI/CD
{ id: "7.1", service: "ElasticBeanstalk", name: "Elastic Beanstalk 보안(환경변수 비밀 금지와 IAM 최소권한, 버킷 공개 금지)" },
{ id: "7.2", service: "Amplify", name: "Amplify 과거 Role 정리(취약하거나 과권한 Role 점검/제거)" },
{ id: "7.3", service: "CI/CD", name: "CI/CD 비밀 보호/STS 사용(로그/아티팩트 비밀 노출 금지)" },
// CloudTrail
{ id: "8.1", service: "CloudTrail", name: "CloudTrail 다중 리전 추적 활성 및 API 활동 전체 로깅" },
{ id: "8.2", service: "CloudTrail", name: "CloudTrail 로그 파일 검증 활성화" },
// ACM-PCA / PHZ
{ id: "9.1", service: "ACM-PCA", name: "ACM-PCA/PHZ 안전 구성(DNS 오용 차단과 인증서 신뢰체계 검증/고정)" },
];

const services = Array.from(new Set(checklist.map((c) => c.service)));

export default function Checklist() {

  const [selectedServices, setSelectedServices] = useState<string[]>(services);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
      setAnswers({});
    } else {
      setSelectedServices([...selectedServices, service]);
      setAnswers({});
    }
  };

  const filteredChecklist = checklist.filter((item) =>
    selectedServices.includes(item.service)
  );

  const totalItems = filteredChecklist.length;
  const scorePerItem = totalItems > 0 ? 10 / totalItems : 0;
  const totalScore = filteredChecklist.reduce((score, item) => {
    return answers[item.id] === true ? score + scorePerItem : score;
  }, 0);

  return (
    <section id="Checklist" className="py-12 bg-gray-100">
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          AWS 보안 체크리스트
        </h1>

        {/* 서비스 선택 버튼 */}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {services.map((service) => (
            <button
              key={service}
              className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                selectedServices.includes(service)
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => toggleService(service)}
            >
              {service}
            </button>
          ))}
        </div>

        {/* Select All / Clear */}
        <div className="flex gap-2 mb-6">
          <button
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            onClick={() => {
              setSelectedServices(services);
              setAnswers({});
            }}
          >
            Select All
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              setSelectedServices([]);
              setAnswers({});
            }}
          >
            Clear
          </button>
        </div>

        {/* 체크리스트 테이블 */}
        <table className="table-auto w-full border-collapse border border-gray-300 shadow-sm rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border border-gray-300 p-3 text-left">서비스</th>
              <th className="border border-gray-300 p-3 text-left">항목</th>
              <th className="border border-gray-300 p-3 text-center">체크</th>
            </tr>
          </thead>
          <tbody>
            {filteredChecklist.map((item) => {
              const answer = answers[item.id]; // true, false, undefined
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">{item.service}</td>
                  <td className="border border-gray-300 p-3">{item.name}</td>
                  <td className="border border-gray-300 p-3 text-center flex justify-center gap-2">
                    {/* O 버튼 */}
                    <button
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                        answer === true
                          ? "bg-green-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-green-100"
                      }`}
                      onClick={() => setAnswers({ ...answers, [item.id]: true })}
                    >
                      O
                    </button>
                    {/* X 버튼 */}
                    <button
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                        answer === false
                          ? "bg-red-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-red-100"
                      }`}
                      onClick={() => setAnswers({ ...answers, [item.id]: false })}
                    >
                      X
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 총점 */}
        <div className="mt-6 text-right text-lg font-semibold text-gray-800">
          총점: <span className="text-blue-600">{totalScore.toFixed(2)}</span> / 10 점
        </div>
      </div>
    </section>
  );
}