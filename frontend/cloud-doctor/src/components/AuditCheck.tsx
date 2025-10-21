import { useState, useEffect } from "react";
import { auditApi, AuditResponse, AVAILABLE_CHECKS } from "../api/audit";
import { userApi } from "../api/user";

const CHECK_TO_SERVICE: Record<string, string> = {
  IAMRootMFACheck: "iam",
  IAMTrustPolicyWildcardCheck: "iam",
  IAMPassRoleWildcardResourceCheck: "iam",
  IAMIdPAssumeRoleCheck: "iam",
  IAMCrossAccountAssumeRoleCheck: "iam",
  IAMAccessKeyAgeCheck: "iam",
  IAMRootAccessKeyCheck: "iam",
  IAMMFACheck: "iam",
  S3PublicAccessCheck: "s3",
  S3EncryptionCheck: "s3",
  S3BucketPolicyPublicActionsCheck: "s3",
  EC2IMDSv2Check: "ec2",
  EC2PublicIPCheck: "ec2",
  EC2AMIPrivateCheck: "ec2",
  EBSSnapshotPrivateCheck: "ec2",
  EKSIRSARoleCheck: "eks",
  KMSImportedKeyMaterialCheck: "kms",
  IAMRoleCloudFormationPassRoleCheck: "cloudformation",
  CloudTrailManagementEventsCheck: "cloudtrail",
  CloudTrailLoggingCheck: "cloudtrail",
  CognitoTokenExpirationCheck: "cognito",
  ElasticBeanstalkCredentialsCheck: "elasticbeanstalk",
  IAMGluePassRoleCheck: "glue",
  GuardDutyStatusCheck: "guardduty",
  OpenSearchSecurityCheck: "opensearch",
  OrganizationsSCPCheck: "organizations",
  RDSPublicAccessibilityCheck: "rds",
  SNSAccessPolicyCheck: "sns",
  SQSAccessPolicyCheck: "sqs",
  SESOverlyPermissiveCheck: "ses",
  IAMSSMCommandPolicyCheck: "ssm",
  BedrockModelAccessCheck: "bedrock",
  AppStreamOverlyPermissiveCheck: "appstream2.0",
};

export default function AuditCheck() {
  const [accountId, setAccountId] = useState("");
  const [roleName, setRoleName] = useState("CloudDoctorAuditRole");
  const [externalId, setExternalId] = useState("");
  // const [maskedExternalId, setMaskedExternalId] = useState("");
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [error, setError] = useState("");

  // useEffect(() => {
  //   const fetchUserInfo = async () => {
  //     try {
  //       const userInfo = await userApi.getMe();
  //       if (userInfo.externalId) {
  //         setExternalId(userInfo.externalId);
  //         setMaskedExternalId("*".repeat(userInfo.externalId.length));
  //       }
  //     } catch (err) {
  //       console.error("사용자 정보 로드 실패:", err);
  //     }
  //   };
  //   fetchUserInfo();
  // }, []);

  const handleCheckToggle = (checkId: string) => {
    setSelectedChecks((prev) =>
      prev.includes(checkId)
        ? prev.filter((id) => id !== checkId)
        : [...prev, checkId]
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await auditApi.startAudit({
        account_id: accountId,
        role_name: roleName || undefined,
        external_id: externalId || undefined,
        checks: selectedChecks.length > 0 ? selectedChecks : undefined,
      });
      console.log("Backend response:", response);
      console.log("guideline_ids:", response.guideline_ids);
      console.log("First result check_id:", response.results?.[0]?.check_id);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "점검 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-primary-dark py-12">
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-beige to-primary-light bg-clip-text text-transparent">
          🔍 AWS 보안 점검
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-beige mb-2">AWS Account ID *</label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="123456789012"
                required
                className="w-full px-4 py-2 rounded bg-white/20 text-white placeholder-white/50"
              />
            </div>

            <div>
              <label className="block text-beige mb-2">Role Name</label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="CloudDoctorAuditRole"
                className="w-full px-4 py-2 rounded bg-white/20 text-white placeholder-white/50"
              />
            </div>

            {/* <div>
              <label className="block text-beige mb-2">
                External ID (자동 입력됨)
              </label>
              <input
                type="text"
                value={maskedExternalId}
                readOnly
                placeholder="로그인 후 자동 입력"
                className="w-full px-4 py-2 rounded bg-white/10 text-white placeholder-white/50 cursor-not-allowed"
              />
            </div> */}

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-beige">
                  점검 항목 (선택 안하면 전체)
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedChecks([])}
                  className="text-xs text-beige/70 hover:text-beige underline"
                >
                  초기화
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {AVAILABLE_CHECKS.map((check) => (
                  <label
                    key={check.id}
                    className="flex items-center space-x-2 text-white cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedChecks.includes(check.id)}
                      onChange={() => handleCheckToggle(check.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{check.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-beige text-primary-dark py-3 rounded font-bold hover:bg-primary-light disabled:opacity-50"
            >
              {loading ? "점검 중..." : "점검 시작"}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded mb-6">
            ❌ {error}
          </div>
        )}

        {result && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-beige mb-4">점검 결과</h2>
            <div className="mb-4 text-white">
              <p>Audit ID: {result.audit_id}</p>
              <p>상태: {result.status}</p>
              <p>시작: {new Date(result.started_at).toLocaleString()}</p>
              {result.completed_at && (
                <p>완료: {new Date(result.completed_at).toLocaleString()}</p>
              )}
            </div>

            {result.summary && (
              <div className="grid grid-cols-5 gap-4 mb-6">
                <div className="bg-white/10 p-4 rounded text-center">
                  <div className="text-2xl font-bold text-white">
                    {result.summary.total}
                  </div>
                  <div className="text-sm text-beige">전체</div>
                </div>
                <div className="bg-green-500/20 p-4 rounded text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {result.summary.pass}
                  </div>
                  <div className="text-sm text-beige">양호</div>
                </div>
                <div className="bg-red-500/20 p-4 rounded text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {result.summary.fail}
                  </div>
                  <div className="text-sm text-beige">취약</div>
                </div>
                <div className="bg-yellow-500/20 p-4 rounded text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {result.summary.warn}
                  </div>
                  <div className="text-sm text-beige">경고</div>
                </div>
                <div className="bg-gray-500/20 p-4 rounded text-center">
                  <div className="text-2xl font-bold text-gray-400">
                    {result.summary.error}
                  </div>
                  <div className="text-sm text-beige">오류</div>
                </div>
              </div>
            )}

            {result.results && result.results.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-beige mb-2">상세 결과</h3>
                {result.results.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded ${
                      item.status === "PASS"
                        ? "bg-green-500/10 border-green-500"
                        : item.status === "FAIL"
                        ? "bg-red-500/10 border-red-500"
                        : "bg-gray-500/10 border-gray-500"
                    } border`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white">
                          {item.check_id}
                        </div>
                        <div className="text-sm text-beige mt-1">
                          {item.message}
                        </div>
                        <div className="text-xs text-white/70 mt-1">
                          Resource: {item.resource_id}
                        </div>
                        {item.details && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-white/50 hover:text-white font-bold">
                              Raw 데이터 보기
                            </summary>
                            <pre className="mt-1 text-xs text-white/60 overflow-x-auto max-h-48 bg-black/20 p-2 rounded whitespace-pre">
                              {JSON.stringify(item.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span
                          className={`px-3 py-1 rounded text-sm font-bold ${
                            item.status === "PASS"
                              ? "bg-green-500 text-white"
                              : item.status === "FAIL"
                              ? "bg-red-500 text-white"
                              : item.status === "WARN"
                              ? "bg-yellow-500 text-white"
                              : "bg-gray-500 text-white"
                          }`}
                        >
                          {item.status === "FAIL"
                            ? "취약"
                            : item.status === "PASS"
                            ? "양호"
                            : item.status === "ERROR"
                            ? "오류"
                            : item.status === "WARN"
                            ? "경고"
                            : item.status}
                        </span>
                        {(item.status === "FAIL" || item.status === "WARN") &&
                          result.guideline_ids?.[item.check_id] &&
                          CHECK_TO_SERVICE[item.check_id] && (
                            <button
                              onClick={() => {
                                const guidelineId =
                                  result.guideline_ids?.[item.check_id];
                                if (guidelineId) {
                                  window.open(
                                    `/guide/${
                                      CHECK_TO_SERVICE[item.check_id]
                                    }/${guidelineId}`,
                                    "_blank"
                                  );
                                }
                              }}
                              className="px-3 py-1 rounded text-xs font-medium bg-beige/20 text-beige hover:bg-beige hover:text-primary-dark transition-colors cursor-pointer"
                            >
                              조치방안
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
