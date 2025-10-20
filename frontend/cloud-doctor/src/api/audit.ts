import axios from "axios";

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
    const { data } = await axios.post<AuditResponse>(
      `${AUDIT_API_URL}/api/audit/start`,
      request
    );
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
  { id: "ec2_imdsv2", name: "EC2 IMDSv2 강제", category: "EC2" },
  { id: "ec2_public_ip", name: "EC2 퍼블릭 IP", category: "EC2" },
  { id: "ec2_ami_private", name: "EC2 AMI 프라이빗 설정", category: "EC2" },
  {
    id: "ebs_snapshot_private",
    name: "EBS 스냅샷 프라이빗 설정",
    category: "EC2",
  },

  { id: "s3_public_access", name: "S3 퍼블릭 액세스 설정", category: "S3" },
  { id: "s3_encryption", name: "S3 암호화 설정", category: "S3" },
  {
    id: "s3_bucket_policy_public_actions",
    name: "S3 버킷 정책 퍼블릭 액션",
    category: "S3",
  },
  {
    id: "s3_replication_role",
    name: "S3 복제 역할 권한 검증",
    category: "S3",
  },
  {
    id: "iam_access_key_age",
    name: "IAM 액세스 키 수명 (90일)",
    category: "IAM",
  },
  { id: "iam_root_access_key", name: "루트 계정 액세스 키", category: "IAM" },
  {
    id: "iam_trust_policy_wildcard",
    name: "IAM 신뢰 정책 와일드카드",
    category: "IAM",
  },
  {
    id: "iam_pass_role_wildcard_resource",
    name: "IAM PassRole 와일드카드 리소스",
    category: "IAM",
  },
  { id: "iam_idp_assume_role", name: "IAM IdP 역할 위임", category: "IAM" },
  {
    id: "iam_cross_account_assume_role",
    name: "IAM 교차 계정 역할 위임",
    category: "IAM",
  },
  { id: "iam_root_mfa", name: "루트 계정 MFA", category: "IAM" },
  { id: "iam_mfa", name: "IAM 사용자 MFA", category: "IAM" },
  {
    id: "sg_remote_access",
    name: "Security Group SSH/RDP 접근 제한",
    category: "VPC",
  },
  { id: "rds_snapshot_public", name: "RDS 스냅샷 공개 설정", category: "RDS" },
  { id: "rds_public_access", name: "RDS 퍼룔릭 액세스 차단", category: "RDS" },
  { id: "cloudtrail_logging", name: "CloudTrail 로깅", category: "CloudTrail" },
  {
    id: "cloudtrail_management_events",
    name: "CloudTrail 관리 이벤트 로깅",
    category: "CloudTrail",
  },
  { id: "eks_irsarole", name: "EKS IRSA 역할 권한 검증", category: "EKS" },
  {
    id: "kms_key_rotation",
    name: "KMS 외부 키 구성 원본 검증",
    category: "KMS",
  },
  { id: "sns_access_policy", name: "SNS 액세스 정책", category: "SNS" },
  { id: "sns_topic_policy", name: "SNS 주제 액세스 정책", category: "SNS" },
  { id: "sqs_access_policy", name: "SQS 액세스 정책", category: "SQS" },
  {
    id: "organizations_scp",
    name: "Organizations SCP 정책",
    category: "Organizations",
  },
  {
    id: "ecr_repository_security",
    name: "ECR 리포지토리 보안",
    category: "ECR",
  },
  { id: "ssm_command_policy", name: "SSM 명령 정책", category: "SSM" },
  { id: "ssm_document_public", name: "SSM 문서 퍼블릭 권한", category: "SSM" },
  {
    id: "cognito_token_expiration",
    name: "Cognito 토큰 만료 시간 검증",
    category: "Cognito",
  },
  {
    id: "cloudformation_iam_role_pass",
    name: "CloudFormation IAM PassRole 검증",
    category: "CloudFormation",
  },
  {
    id: "opensearch_security",
    name: "OpenSearch 보안 설정",
    category: "OpenSearch",
  },
  {
    id: "opensearch_vpc_access",
    name: "OpenSearch VPC 액세스 전용",
    category: "OpenSearch",
  },
  {
    id: "elasticbeanstalk_credentials",
    name: "Elastic Beanstalk 자격증명 보안",
    category: "ElasticBeanstalk",
  },
  {
    id: "redshift_encryption",
    name: "Redshift 클러스터 암호화",
    category: "Redshift",
  },
  {
    id: "glue_iam_pass_role",
    name: "Glue IAM PassRole 검증",
    category: "Glue",
  },
  {
    id: "docdb_snapshot_private",
    name: "DocumentDB 스냅샷 프라이빗 설정",
    category: "DocumentDB",
  },
  {
    id: "docdb_encryption",
    name: "DocumentDB 클러스터 KMS 암호화",
    category: "DocumentDB",
  },
  {
    id: "guardduty_status",
    name: "GuardDuty 활성화 상태",
    category: "GuardDuty",
  },
  {
    id: "bedrock_model_access",
    name: "Bedrock 모델 액세스",
    category: "Bedrock",
  },
  {
    id: "ses_overly_permissive",
    name: "SES 과도한 권한 설정",
    category: "SES",
  },
  {
    id: "appstream_overly_permissive",
    name: "AppStream 과도한 권한 설정",
    category: "AppStream",
  },
];
