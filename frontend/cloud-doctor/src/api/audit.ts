import axios from "axios";

const AUDIT_API_URL =
  process.env.REACT_APP_AUDIT_API_URL || "http://localhost:8000";

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
  {
    id: "iam_access_key_age",
    name: "IAM 액세스 키 수명 (90일)",
    category: "IAM",
  },
  { id: "iam_root_access_key", name: "루트 계정 액세스 키", category: "IAM" },
  { id: "iam_root_mfa", name: "루트 계정 MFA", category: "IAM" },
  { id: "s3_public_access", name: "S3 퍼블릭 액세스 차단", category: "S3" },
  { id: "s3_encryption", name: "S3 암호화 설정", category: "S3" },
  { id: "ec2_imdsv2", name: "EC2 IMDSv2 강제", category: "EC2" },
  { id: "ec2_public_ip", name: "EC2 퍼블릭 IP", category: "EC2" },
];
