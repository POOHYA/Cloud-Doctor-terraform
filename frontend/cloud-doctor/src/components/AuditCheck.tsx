import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();
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
  const [manualCheckFilter, setManualCheckFilter] = useState("all");
  const [checkFilter, setCheckFilter] = useState("all");
  const [userUuid, setUserUuid] = useState("");
  const [loadingUuid, setLoadingUuid] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const isLoggedIn = !!sessionStorage.getItem("username");
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login", { state: { from: location } });
    }
  }, [navigate, location]);

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
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-4xl font-bold text-white">🔍 AWS 보안 점검</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowManualCheckModal(true)}
              className="px-4 py-2 bg-white/10 text-white border border-white/30 rounded hover:bg-white/20 transition-colors font-medium whitespace-nowrap"
            >
              자동점검 불가 항목
            </button>
            <button
              onClick={() => setShowGuideModal(true)}
              className="px-4 py-2 bg-beige/20 text-beige border border-white/30 rounded hover:bg-white/20 transition-colors font-medium whitespace-nowrap"
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
              <label className="block text-beige mb-2">Role Name *</label>
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
                  readOnly
                  required
                  placeholder="확인 & 복사 버튼으로 UUID 생성"
                  className="flex-1 px-4 py-2 rounded bg-white/10 text-white/90 placeholder-white/50 cursor-not-allowed"
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
              <div className="flex flex-wrap gap-2 mb-3">
                {[...new Set(AVAILABLE_CHECKS.map((check) => check.category))]
                  .sort()
                  .map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        const categoryChecks = AVAILABLE_CHECKS.filter(
                          (check) => check.category === category
                        ).map((check) => check.id);
                        setSelectedChecks((prev) => {
                          const allSelected = categoryChecks.every((id) =>
                            prev.includes(id)
                          );
                          if (allSelected) {
                            return prev.filter(
                              (id) => !categoryChecks.includes(id)
                            );
                          } else {
                            return [...new Set([...prev, ...categoryChecks])];
                          }
                        });
                      }}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        AVAILABLE_CHECKS.filter(
                          (check) => check.category === category
                        ).every((check) => selectedChecks.includes(check.id))
                          ? "bg-beige text-primary-dark"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    >
                      {category.toUpperCase()}
                    </button>
                  ))}
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
                  다음 항목들은 AWS API로 자동 점검이 불가능하거나 정성적
                  평가기준으로 인하여 수동으로 확인이 필요합니다.
                </p>
                {(manualCheckFilter === "all" ||
                  manualCheckFilter === "ec2") && (
                  <div className="bg-beige p-4 rounded-lg">
                    <h3 className="font-bold text-lg leading-relaxed flex items-center">
                      {" "}
                      <a
                        href="/guide/ec2/4"
                        target="_blank"
                        className="text-primary-dark hover:text-accent no-underline"
                      >
                        1. Organizations SCP 정책 설정에서 사전 허용된 계정
                        목록의 AMI만 리스트에 등록
                      </a>
                    </h3>
                  </div>
                )}
                {(manualCheckFilter === "all" ||
                  manualCheckFilter === "s3") && (
                  <div className="bg-beige p-4 rounded-lg">
                    <h3 className="font-bold text-lg leading-relaxed flex items-center">
                      {" "}
                      <a
                        href="/guide/s3/8"
                        target="_blank"
                        className="text-primary-dark hover:text-accent no-underline"
                      >
                        2. S3 ACL의 Grantee 목록에 12자리 숫자(외부 AWS 계정
                        ID)가 있으면 해당 공유를 검증
                      </a>
                    </h3>
                  </div>
                )}
                {(manualCheckFilter === "all" ||
                  manualCheckFilter === "iam") && (
                  <>
                    <div className="bg-beige p-4 rounded-lg">
                      <h3 className="font-bold text-lg leading-relaxed flex items-center">
                        {" "}
                        <a
                          href="/guide/iam/10"
                          target="_blank"
                          className="text-primary-dark hover:text-accent no-underline"
                        >
                          3. 시크릿 스캐닝 도구를 통한 자격증명 평문 저장 여부
                          점검(ex. Trufflehog, Gitleaks 등으로 외부/공개 저장소
                          속 자격증명 평문 저장 점검)
                        </a>
                      </h3>
                    </div>
                    <div className="bg-beige p-4 rounded-lg">
                      <h3 className="font-bold text-lg leading-relaxed flex items-center">
                        {" "}
                        <a
                          href="/guide/iam/11"
                          target="_blank"
                          className="text-primary-dark hover:text-accent no-underline"
                        >
                          4. 민감 정보의 자동 교체 로직이 존재(ex. Secrets
                          Manager의 보안 암호 자동 교체 구성 활성화)
                        </a>
                      </h3>
                    </div>
                    <div className="bg-beige p-4 rounded-lg">
                      <h3 className="font-bold text-lg leading-relaxed flex items-center">
                        {" "}
                        <a
                          href="/guide/iam/17"
                          target="_blank"
                          className="text-primary-dark hover:text-accent no-underline"
                        >
                          5. 퇴직자 계정 권한 철회(ex. 콘솔 로그인 프로필,
                          액세스 키, 연결된 권한 정책, MFA, 인증서, 서비스
                          자격증명을 모두 삭제/해제)
                        </a>
                      </h3>
                    </div>
                    <div className="bg-beige p-4 rounded-lg">
                      <h3 className="font-bold text-lg leading-relaxed flex items-center">
                        {" "}
                        <a
                          href="/guide/iam/17"
                          target="_blank"
                          className="text-primary-dark hover:text-accent no-underline"
                        >
                          6. 퇴직자 계정 활동 모니터링 및 로그 관리 운영체계
                          수립(ex. ConsoleLogin, CreateAccessKey 등의 잔여된
                          의심 활동을 탐지하기 위한 CloudTrail 쿼리 작성)
                        </a>
                      </h3>
                    </div>
                  </>
                )}
                {(manualCheckFilter === "all" ||
                  manualCheckFilter === "vpc") && (
                  <div className="bg-beige p-4 rounded-lg">
                    <h3 className="font-bold text-lg leading-relaxed flex items-center">
                      {" "}
                      <a
                        href="/guide/vpc/20"
                        target="_blank"
                        className="text-primary-dark hover:text-accent no-underline"
                      >
                        7.외부 노출이 강력히 제한되어야 하는 내부 네트워크 운영
                        시, 배스천 호스트 구축
                      </a>
                    </h3>
                  </div>
                )}
                {(manualCheckFilter === "all" ||
                  manualCheckFilter === "lambda") && (
                  <>
                    <div className="bg-beige p-4 rounded-lg">
                      <h3 className="font-bold text-lg leading-relaxed flex items-center">
                        {" "}
                        <a
                          href="/guide/lambda/21"
                          target="_blank"
                          className="text-primary-dark hover:text-accent no-underline"
                        >
                          8. Lambda 함수 실행 시, 환경 변수를 KMS의 고객 마스터
                          키로 사용
                        </a>
                      </h3>
                    </div>
                    <div className="bg-beige p-4 rounded-lg">
                      <h3 className="font-bold text-lg leading-relaxed flex items-center">
                        {" "}
                        <a
                          href="/guide/lambda/22"
                          target="_blank"
                          className="text-primary-dark hover:text-accent no-underline"
                        >
                          9. Lambda 함수에 결함이 존재하는 코드 스캔(ex.
                          Inspector 연동 및 사용 후 결과에서 심각도 HIGH,
                          CRITICAL 미포함)
                        </a>
                      </h3>
                    </div>
                  </>
                )}
                {(manualCheckFilter === "all" ||
                  manualCheckFilter === "cloudtrail") && (
                  <div className="bg-beige p-4 rounded-lg">
                    <h3 className="font-bold text-lg leading-relaxed flex items-center">
                      {" "}
                      <a
                        href="/guide/cloudtrail/26"
                        target="_blank"
                        className="text-primary-dark hover:text-accent no-underline"
                      >
                        10. 비정상적인 API 호출 모니터링 및 로그 관리 운영체계
                        수립(ex. 대량 호출 RunInstances를 탐지 가능한 CloudTrail
                        쿼리 작성)
                      </a>
                    </h3>
                  </div>
                )}
                {(manualCheckFilter === "all" ||
                  manualCheckFilter === "eks") && (
                  <div className="bg-beige p-4 rounded-lg">
                    <h3 className="font-bold text-lg leading-relaxed flex items-center">
                      {" "}
                      <a
                        href="/guide/eks/27"
                        target="_blank"
                        className="text-primary-dark hover:text-accent no-underline"
                      >
                        11. EKS 사용 시, 쿠버네티스의 서비스 계정별로 IAM 역할
                        할당
                      </a>
                    </h3>
                  </div>
                )}
                {(manualCheckFilter === "all" ||
                  manualCheckFilter === "kms") && (
                  <>
                    <div className="bg-beige p-4 rounded-lg">
                      <h3 className="font-bold text-lg leading-relaxed flex items-center">
                        {" "}
                        <a
                          href="/guide/kms/28"
                          target="_blank"
                          className="text-primary-dark hover:text-accent no-underline"
                        >
                          12. KMS에서 외부 고객 관리형 키 Reimport/삭제 시, 키
                          정책 속 Action은 특정 권한으로 제한되어 있고,
                          Resource는 해당 고객 관리형 키의 ARN으로 제한하고,
                          MFA를 강제
                        </a>
                      </h3>
                    </div>
                    <div className="bg-beige p-4 rounded-lg">
                      <h3 className="font-bold text-lg leading-relaxed flex items-center">
                        {" "}
                        <a
                          href="/guide/kms/28"
                          target="_blank"
                          className="text-primary-dark hover:text-accent no-underline"
                        >
                          13. KMS에서 외부 고객 관리형 키의 키 정책 속
                          Principal의 KMS 관련 고위험 권한(ex.
                          kms:ImportKeyMaterial, kms:decrypt)을 특정 고객 관리형
                          키의 역할 ARN으로 제한
                        </a>
                      </h3>
                    </div>
                  </>
                )}
                {(manualCheckFilter === "all" ||
                  manualCheckFilter === "route53") && (
                  <div className="bg-beige p-4 rounded-lg">
                    <h3 className="font-bold text-lg leading-relaxed flex items-center">
                      {" "}
                      <a
                        href="/guide/route53/31"
                        target="_blank"
                        className="text-primary-dark hover:text-accent no-underline"
                      >
                        14. Route 53 레코드에 실제 소유/운영 중인 리소스만 존재
                      </a>
                    </h3>
                  </div>
                )}
                {(manualCheckFilter === "all" ||
                  manualCheckFilter === "organizations") && (
                  <>
                    <div className="bg-beige p-4 rounded-lg">
                      <h3 className="font-bold text-lg leading-relaxed flex items-center">
                        {" "}
                        <a
                          href="/guide/organizations/32"
                          target="_blank"
                          className="text-primary-dark hover:text-accent no-underline"
                        >
                          15. Organizations의 신뢰할 수 있는 액세스가 업무상
                          필요한 서비스에만 활성화
                        </a>
                      </h3>
                    </div>
                    <div className="bg-beige p-4 rounded-lg">
                      <h3 className="font-bold text-lg leading-relaxed flex items-center">
                        {" "}
                        <a
                          href="/guide/organizations/33"
                          target="_blank"
                          className="text-primary-dark hover:text-accent no-underline"
                        >
                          16. Organizations SCP 정책 속 불필요한 API(ex.
                          ModifyReservedInstances, aws-marketplace:Subscribe)에
                          대해 Deny로 설정
                        </a>
                      </h3>
                    </div>
                  </>
                )}
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
                    {" "}
                    <a
                      href="/guide/cognito/38"
                      target="_blank"
                      className="text-primary-dark hover:text-accent no-underline"
                    >
                      17. Cognito Identity Pool에 연결된 IAM 역할 정책 속
                      Action은 필요 권한으로, Resource는 해당 역할이 접근 가능한
                      리소스의 ARN으로, Condition은 비인증(Unauthenticated)
                      역할에 대한 민감 리소스 접근 권한을 제한
                    </a>
                  </h3>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
                    {" "}
                    <a
                      href="/guide/cognito/38"
                      target="_blank"
                      className="text-primary-dark hover:text-accent no-underline"
                    >
                      18. Cognito를 통한 사용자 관리 시, 내부 서비스거나 관리자
                      계정만 발급해야 하는 경우 Self Sign Up 비활성화
                    </a>
                  </h3>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
                    {" "}
                    <a
                      href="/guide/cognito/39"
                      target="_blank"
                      className="text-primary-dark hover:text-accent no-underline"
                    >
                      19. 조직 내 Service Catalog 포트폴리오 공유가 필요한 경우,
                      조직 전체에 AcceptPortfolioShare 차단하는 SCP 정책 작성 및
                      조직 구조 내의 공유 방법 선택
                    </a>
                  </h3>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
                    {" "}
                    <a
                      href="/guide/servicecatalog/46"
                      target="_blank"
                      className="text-primary-dark hover:text-accent no-underline"
                    >
                      20. Service Catalog 제약 조건 생성 시 할당하는 IAM 역할에
                      Principal은 Service Catalog 서비스 지정, Action은 고위험
                      권한(ex. iam:CreatePolicy, iam:AttachRolePolicy) Deny,
                      Condition은 호출 출처 제한
                    </a>
                  </h3>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
                    {" "}
                    <a
                      href="/guide/ses/49"
                      target="_blank"
                      className="text-primary-dark hover:text-accent no-underline"
                    >
                      21. SES 고위험 권한(ex. SendEmail, PutAccountDetails)을
                      승인된 관리자 또는 서비스 전용 IAM 역할에만 허용
                    </a>
                  </h3>
                </div>
                <div className="bg-beige p-4 rounded-lg">
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
                    {" "}
                    <a
                      href="/guide/appstream2.0/50"
                      target="_blank"
                      className="text-primary-dark hover:text-accent no-underline"
                    >
                      22. AppStream의 Fleet/이미지 빌더에 연결된 IAM 역할 정책
                      속 Resource를 특정 IAM 역할의 ARN으로 제한
                    </a>
                  </h3>
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
                  📑 점검용 IAM role 생성 가이드
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
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
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
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
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
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
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
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
                    4️⃣ 새 리소스 생성
                  </h3>
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
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
                    5️⃣ 스택생성
                  </h3>
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
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
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
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
                    7️⃣ 스택 옵션 구성
                  </h3>
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
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
                    8️⃣ 검토 & 생성
                  </h3>
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
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
                    {" "}
                    9️⃣ 생성 완료 확인
                  </h3>
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
                  <h3 className="font-bold text-lg leading-relaxed flex items-center">
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
