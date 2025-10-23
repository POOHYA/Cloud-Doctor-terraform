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
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showManualCheckModal, setShowManualCheckModal] = useState(false);
  const [userUuid, setUserUuid] = useState("");
  const [loadingUuid, setLoadingUuid] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
  const fetchAndCopyUuid = async () => {
    setLoadingUuid(true);
    try {
      const response = await userApi.getUuid();
      setUserUuid(response);
      setExternalId(response);

      // 클립보드에 복사
      await navigator.clipboard.writeText(response);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err: any) {
      setError("UUID 조회/복사 실패: " + (err.response?.data || err.message));
    } finally {
      setLoadingUuid(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("복사 실패:", err);
    }
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
      console.error("에러 전체:", err);
      console.error("에러 응답:", err.response);
      console.error("에러 데이터:", err.response?.data);

      // 백엔드에서 온 에러 메시지 처리
      let errorMessage = "점검 실패";

      if (err.response?.data) {
        // 백엔드에서 문자열로 보낸 경우
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        }
        // JSON 객체로 보낸 경우
        else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-primary-dark py-12">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold mb-8 text-white">
            🔍 AWS 보안 점검
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowManualCheckModal(true)}
              className="px-4 py-2 bg-white/10 text-white border border-white/30 rounded hover:bg-white/20 transition-colors font-medium"
            >
              자동점검 불가 항목
            </button>
            <button
              onClick={() => setShowGuideModal(true)}
              className="px-4 py-2 bg-beige/20 text-beige border border-white/30 rounded hover:bg-white/20 transition-colors font-medium"
            >
              점검 IAM role 생성 가이드
            </button>
          </div>
        </div>

        {/* 성공/에러 메시지 - 헤더 바로 아래 */}
        {result && (
          <div className="bg-green-500/20 border border-green-500 text-white p-4 rounded mb-6">
            ✅ 점검 완료! 스크롤해서 결과를 확인해주세요.
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded mb-6">
            ❌ {error}
          </div>
        )}

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
                placeholder="점검할 AWS 계정 ID(숫자12자리)"
                required
                className="w-full px-4 py-2 rounded bg-white/20 text-white placeholder-white/50"
              />
            </div>

            <div>
              <label className="block text-beige mb-2">Role Name</label>
              <input
                type="text"
                value={roleName}
                readOnly
                placeholder="CloudDoctorAuditRole"
                className="w-full px-4 py-2 rounded bg-white/10 text-white/70 placeholder-white/50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-beige mb-2">External ID *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={externalId}
                  onChange={(e) => setExternalId(e.target.value)}
                  placeholder="확인 & 복사 버튼으로 UUID 생성"
                  required
                  className="flex-1 px-4 py-2 rounded bg-white/20 text-white placeholder-white/50"
                />
                <button
                  type="button"
                  onClick={fetchAndCopyUuid}
                  disabled={loadingUuid}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    copySuccess
                      ? "bg-green-500 text-white"
                      : "bg-accent text-white hover:bg-accent/80"
                  } disabled:opacity-50`}
                >
                  {loadingUuid
                    ? "로딩..."
                    : copySuccess
                    ? "복사완료!"
                    : "확인&복사"}
                </button>
              </div>
            </div>

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

        {showManualCheckModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowManualCheckModal(false)}
          >
            <div
              className="bg-primary-light rounded-lg p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-primary-dark">
                  📋 자동점검 불가 항목
                </h2>
                <button
                  onClick={() => setShowManualCheckModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-6 text-gray-700">
                <p className="text-gray-700 mb-4">
                  다음 항목들은 AWS API로 자동 점검이 불가능하여 수동으로 확인이
                  필요합니다.
                </p>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">
                    1️⃣ IAM 패스워드 정책
                  </h3>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>AWS 콘솔에서 IAM → 계정 설정 → 암호 정책 확인 필요</li>
                  </ul>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">2️⃣ MFA 활성화 여부</h3>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>
                      루트 계정 및 IAM 사용자의 MFA 설정 상태 수동 확인 필요
                    </li>
                  </ul>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">
                    3️⃣ CloudTrail 로그 무결성 검증
                  </h3>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>로그 파일 검증 활성화 여부 콘솔에서 확인 필요</li>
                  </ul>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">
                    4️⃣ 네트워크 ACL 규칙
                  </h3>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>
                      VPC 네트워크 ACL의 인바운드/아웃바운드 규칙 수동 검토 필요
                    </li>
                  </ul>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">
                    5️⃣ 리소스 태그 정책 준수
                  </h3>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>조직의 태그 정책 준수 여부는 수동 확인 필요</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {showGuideModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGuideModal(false)}
          >
            <div
              className="bg-primary-light rounded-lg p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-primary-dark">
                  점검용 IAM role 생성 가이드
                </h2>
                <div className="flex items-center gap-3">
                  <a
                    href="/clouddoctor-role.yaml"
                    download="clouddoctor-role.yaml"
                    className="px-4 py-2 bg-accent text-white rounded font-medium hover:bg-accent/80 transition-colors"
                  >
                    yaml파일 다운
                  </a>
                  <button
                    onClick={() => setShowGuideModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    &times;
                  </button>
                </div>
              </div>
              <div className="space-y-6 text-gray-700">
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">
                    1️⃣ External ID 확인 & 복사
                  </h3>
                  <div className="bg-gray-100 rounded p-4 mb-2">
                    <img
                      src="/img/rolecreate/role-1.png"
                      alt="CloudFormation 접속"
                      className="w-full rounded"
                    />
                  </div>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>보안 점검 탭에서 External ID 확인 & 복사 버튼 클릭</li>
                  </ul>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">
                    2️⃣ yaml파일 다운 및 수정
                  </h3>
                  <div className="bg-gray-100 rounded p-4 mb-2">
                    <img
                      src="/img/rolecreate/role-2.png"
                      alt="CloudFormation 접속"
                      className="w-full rounded"
                    />
                  </div>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>오른쪽 상단의 yaml파일 다운 버튼 클릭</li>
                    <li>
                      파일을 연 후 27줄의 &lt;고객-ExternalId&gt;를 1에서 복사한
                      ID로 수정
                    </li>
                  </ul>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">
                    3️⃣ CloudFormation 접속
                  </h3>
                  <div className="bg-gray-100 rounded p-4 mb-2">
                    <img
                      src="/img/rolecreate/role-3.png"
                      alt="CloudFormation 접속"
                      className="w-full rounded"
                    />
                  </div>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>AWS 서비스를 사용하는 reagion 확인</li>
                    <li>AWS 콘솔 상단 검색창에서 CloudFormation 검색</li>
                    <li>다음 클릭</li>
                  </ul>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">4️⃣ 새 리소스 생성</h3>
                  <div className="bg-gray-100 rounded p-4 mb-2">
                    <img
                      src="/img/rolecreate/role-4.png"
                      alt="새 리소스 생성"
                      className="w-full rounded"
                    />
                  </div>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>스택 생성 → 새 리소스 사용(표준) 선택</li>
                  </ul>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">5️⃣ 스택생성</h3>
                  <div className="bg-gray-100 rounded p-4 mb-2">
                    <img
                      src="/img/rolecreate/role-5.png"
                      alt="스택생성"
                      className="w-full rounded"
                    />
                  </div>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>기존 템플릿 선택 → 템플릿 파일 업로드 선택</li>
                    <li>템플릿 파일 업로드 → 파일 선택</li>
                    <li>
                      위에서 다운로드 한 clouddoctor-role.yaml 선택 후 업로드
                    </li>
                    <li>다음 클릭</li>
                  </ul>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">
                    6️⃣ 스택 세부 정보 지정
                  </h3>
                  <div className="bg-gray-100 rounded p-4 mb-2">
                    <img
                      src="/img/rolecreate/role-6.png"
                      alt="스택 세부 정보 지정"
                      className="w-full rounded"
                    />
                  </div>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>스택 이름: [스택 명] 입력</li>
                    <li>다음 클릭</li>
                  </ul>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">7️⃣ 스택 옵션 구성</h3>
                  <div className="bg-gray-100 rounded p-4 mb-2">
                    <img
                      src="/img/rolecreate/role-7.png"
                      alt="스택 옵션 구성"
                      className="w-full rounded"
                    />
                  </div>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>기능 - IAM resources 생성 허용 체크</li>
                    <li>다음 클릭</li>
                  </ul>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">8️⃣ 검토 & 생성</h3>
                  <div className="bg-gray-100 rounded p-4 mb-2">
                    <img
                      src="/img/rolecreate/role-8.png"
                      alt="검토 & 생성"
                      className="w-full rounded"
                    />
                  </div>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>입력 정보 확인</li>
                    <li>전송 클릭</li>
                  </ul>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3"> 9️⃣ 생성 완료 확인</h3>
                  <div className="bg-gray-100 rounded p-4 mb-2">
                    <img
                      src="/img/rolecreate/role-9.png"
                      alt="생성 완료 확인"
                      className="w-full rounded"
                    />
                  </div>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>스택 상태: CREATE_COMPLETE</li>
                  </ul>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">
                    🔟 리소스 탭에서 IAM Role 확인
                  </h3>
                  <div className="bg-gray-100 rounded p-4 mb-2">
                    <img
                      src="/img/rolecreate/role-10.png"
                      alt="IAM Role 확인"
                      className="w-full rounded"
                    />
                  </div>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>IAM → 역할 → CloudDoctorAuditRole</li>
                  </ul>
                </div>
                {userUuid && (
                  <div className="bg-accent/10 border border-accent p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-3 text-accent">
                      🔑 내 External ID (UUID)
                    </h3>
                    <div className="bg-gray-100 rounded p-4 mb-2">
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">
                          {userUuid}
                        </code>
                        <button
                          onClick={() => copyToClipboard(userUuid)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            copySuccess
                              ? "bg-green-500 text-white"
                              : "bg-accent text-white hover:bg-accent/80"
                          }`}
                        >
                          {copySuccess ? "복사완료!" : "복사"}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      위 UUID를 AWS IAM Role의 Trust Policy에서 ExternalId로
                      사용하세요.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
