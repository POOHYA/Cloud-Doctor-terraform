import { useState } from "react";
import { auditApi, AuditResponse, AVAILABLE_CHECKS } from "../api/audit";

export default function AuditCheck() {
  const [accountId, setAccountId] = useState("");
  const [roleName, setRoleName] = useState("CloudDoctorAuditRole");
  const [externalId, setExternalId] = useState("");
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [error, setError] = useState("");

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

            <div>
              <label className="block text-beige mb-2">
                External ID (선택)
              </label>
              <input
                type="text"
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                placeholder="unique-external-id"
                className="w-full px-4 py-2 rounded bg-white/20 text-white placeholder-white/50"
              />
            </div>

            <div>
              <label className="block text-beige mb-2">
                점검 항목 (선택 안하면 전체)
              </label>
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
                  <div className="text-sm text-beige">통과</div>
                </div>
                <div className="bg-red-500/20 p-4 rounded text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {result.summary.fail}
                  </div>
                  <div className="text-sm text-beige">실패</div>
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
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-bold text-white">
                          {item.check_id}
                        </div>
                        <div className="text-sm text-beige mt-1">
                          {item.message}
                        </div>
                        <div className="text-xs text-white/70 mt-1">
                          Resource: {item.resource_id}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-sm font-bold ${
                          item.status === "PASS"
                            ? "bg-green-500 text-white"
                            : item.status === "FAIL"
                            ? "bg-red-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {item.status}
                      </span>
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
