import axios from "./axios";

const AUDIT_API_URL =
  process.env.REACT_APP_AUDIT_API_URL || "https://localhost:8000";

export interface AuditRequest {
  account_id: string;
  role_name?: string;
  external_id?: string;
  checks?: string[];
}

export interface CheckResult {
  check_id: string;
  status: string;
  resource_id: string;
  message: string;
  details?: Record<string, any>;
}

export interface AuditResponse {
  audit_id: string;
  account_id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  results?: CheckResult[];
  raw?: Record<string, any[]>;
  guideline_id?: number;
  guideline_ids?: Record<string, number>;

  summary?: {
    total: number;
    pass: number;
    fail: number;
    warn: number;
    error: number;
  };
  error?: string;
}

export const auditApi = {
  startAudit: async (request: AuditRequest): Promise<AuditResponse> => {
    const { data } = await axios.post<AuditResponse>(`/api/user/audit/start`, {
      accountId: request.account_id,
      roleName: request.role_name,
      externalId: request.external_id,
      checks: request.checks,
    });
    return data;
  },

  getAuditStatus: async (auditId: string): Promise<AuditResponse> => {
    const { data } = await axios.get<AuditResponse>(
      `${AUDIT_API_URL}/api/audit/status/${auditId}`
    );
    return data;
  },

  healthCheck: async (): Promise<{ status: string }> => {
    const { data } = await axios.get(`${AUDIT_API_URL}/health`);
    return data;
  },
};

export const AVAILABLE_CHECKS = [
  { id: "EC2IMDSv2Check", name: "EC2 IMDSv2 사용", category: "ec2" },
  { id: "EC2AMIPrivateCheck", name: "EC2 AMI 프라이빗 설정", category: "ec2" },
  {
    id: "EBSSnapshotPrivateCheck",
    name: "EBS 스냅샷 프라이빗 설정",
    category: "ec2",
  },
  {
    id: "S3PublicAccessAndPolicyCheck",
    name: "S3 퍼블릭 액세스 차단",
    category: "s3",
  },
  { id: "S3ACLCheck", name: "S3 버킷 ACL 설정 검증", category: "s3" },
  {
    id: "S3ReplicationRuleCheck",
    name: "S3 버킷 복제 규칙 최소 설정",
    category: "s3",
  },
  {
    id: "S3EncryptionCheck",
    name: "S3 버킷 암호화 설정",
    category: "s3",
  },
  {
    id: "IAMTrustPolicyWildcardCheck",
    name: "IAM 신뢰 정책 와일드카드 사용 금지",
    category: "iam",
  },
  // { id: "IAMIdPAssumeRoleCheck", name: "IAM IdP 역할 위임", category: "iam" },
  {
    id: "IAMCrossAccountAssumeRoleCheck",
    name: "IAM cross account 역할 위임",
    category: "iam",
  },
  // {
  //   id: "IAMAccessKeyAgeCheck",
  //   name: "IAM 액세스 키 수명 (90일)",
  //   category: "iam",
  // },
  {
    id: "IAMRootAccessKeyCheck",
    name: "IAM 루트 계정 액세스 키 사용금지",
    category: "iam",
  },
  {
    id: "IAMMFACheck",
    name: "IAM 모든 사용자 계정 MFA 활성화",
    category: "iam",
  },
  // {
  //   id: "IAMPassRoleWildcardResourceCheck",
  //   name: "IAM PassRole 리소스에 와일드카드 존재 검증",
  //   category: "iam",
  // },
  {
    id: "SecurityGroupRemoteAccessCheck",
    name: "VPC Security Group SSH/RDP 접근 제한",
    category: "vpc",
  },
  {
    id: "RDSPublicAccessibilityCheck",
    name: "RDS 퍼블릭 액세스 차단",
    category: "rds",
  },
  {
    id: "RDSSnapshotPublicAccessCheck",
    name: "RDS 스냅샷 퍼블릭 액세스 차단",
    category: "rds",
  },
  // {
  //   id: "CloudTrailManagementEventsCheck",
  //   name: "CloudTrail 읽기/쓰기 모두 로깅 활성화",
  //   category: "cloudtrail",
  // },
  {
    id: "CloudTrailLoggingCheck",
    name: "CloudTrail 로깅 활성화",
    category: "cloudtrail",
  },
  // { id: "EKSIRSARoleCheck", name: "EKS IRSA 역할 권한 검증", category: "eks" },
  // {
  //   id: "KMSImportedKeyMaterialCheck",
  //   name: "KMS 외부 키 구성 원본 검증",
  //   category: "kms",
  // },
  { id: "SNSAccessPolicyCheck", name: "SNS 액세스 정책", category: "sns" },

  { id: "SQSAccessPolicyCheck", name: "SQS 액세스 정책", category: "sqs" },
  {
    id: "OrganizationsSCPCheck",
    name: "Organizations SCP 정책",
    category: "organizations",
  },
  {
    id: "ECRRepositorySecurityCheck",
    name: "ECR 레포지토리 보안 설정",
    category: "ecr",
  },
  // { id: "IAMSSMCommandPolicyCheck", name: "SSM 명령 정책", category: "ssm" },
  {
    id: "SSMDocumentPublicAccessCheck",
    name: "SSM 문서 브라이빗 설정",
    category: "ssm",
  },
  {
    id: "GuardDutyStatusCheck",
    name: "GuardDuty 활성화",
    category: "guardduty",
  },
  {
    id: "CognitoTokenExpirationCheck",
    name: "Cognito 토큰 만료 시간 검증",
    category: "cognito",
  },
  {
    id: "IAMRoleCloudFormationPassRoleCheck",
    name: "CloudFormation IAM PassRole 검증",
    category: "cloudformation",
  },
  {
    id: "OpenSearchSecurityCheck",
    name: "OpenSearch 도메인 엑세스 정책 설정",
    category: "opensearch",
  },
  {
    id: "OpenSearchVPCAccessCheck",
    name: "OpenSearch VPC 설정",
    category: "opensearch",
  },
  // {
  //   id: "ElasticBeanstalkCredentialsCheck",
  //   name: "Elastic Beanstalk 자격증명 보안",
  //   category: "elasticbeanstalk",
  // },
  {
    id: "RedshiftEncryptionCheck",
    name: "Redshift 암호화 설정",
    category: "redshift",
  },
  {
    id: "IAMGluePassRoleCheck",
    name: "Glue IAM PassRole 검증",
    category: "glue",
  },
  {
    id: "DocumentDBSnapshotPrivateCheck",
    name: "DocumentDB 스냅샷 프라이빗 설정",
    category: "documentdb",
  },
  {
    id: "DocumentDBEncryptionCheck",
    name: "DocumentDB 암호화 설정",
    category: "documentdb",
  },
  {
    id: "BedrockModelAccessCheck",
    name: "Bedrock 모델 호출권한 리소스 최소화",
    category: "bedrock",
  },
  {
    id: "SESOverlyPermissiveCheck",
    name: "SES 고위험 권한의 최소 권한 설정",
    category: "ses",
  },
  // {
  //   id: "AppStreamOverlyPermissiveCheck",
  //   name: "AppStream 최소 권한 설정",
  //   category: "appstream2.0",
  // },
];
