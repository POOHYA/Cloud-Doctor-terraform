import { useState, useEffect } from "react";
import { adminApi } from "../../api/admin";

interface ChecklistGeneratorProps {
  providerName: string;
  providerId: number;
}

export default function ChecklistGenerator({
  providerName,
  providerId,
}: ChecklistGeneratorProps) {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState("");
  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [guidelineId, setGuidelineId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
    loadChecklists();
  }, [providerId]);

  useEffect(() => {
    if (selectedService) {
      loadGuidelines();
    }
  }, [selectedService]);

  const loadServices = async () => {
    try {
      const data = await adminApi.getServicesByProvider(providerId);
      setServices(data);
    } catch (error) {
      console.error("서비스 로드 실패:", error);
    }
  };

  const loadGuidelines = async () => {
    try {
      const data = await adminApi.getGuidelinesByService(
        parseInt(selectedService)
      );
      setGuidelines(data);
      setGuidelineId("");
    } catch (error) {
      console.error("가이드라인 로드 실패:", error);
    }
  };

  const loadChecklists = async () => {
    try {
      const data = await adminApi.getAdminChecklists();
      setChecklists(data);
    } catch (error) {
      console.error("체크리스트 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guidelineId || !title.trim()) return;

    setSubmitting(true);
    try {
      await adminApi.createChecklist({
        guidelineId: parseInt(guidelineId),
        title: title.trim(),
        description: description.trim(),
      });

      setGuidelineId("");
      setTitle("");
      setDescription("");
      await loadChecklists();
      alert("체크리스트가 성공적으로 추가되었습니다.");
    } catch (error: any) {
      console.error("체크리스트 추가 실패:", error);
      alert(error.response?.data?.message || "체크리스트 추가에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold text-beige">
          {providerName} 체크리스트 관리
        </h1>
      </div>
      <div className="bg-surface rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-primary-dark">
          체크리스트 생성
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-primary-dark">
              서비스 *
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full p-3 border rounded-md"
              required
            >
              <option value="">서비스를 선택하세요</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-primary-dark">
              가이드라인 *
            </label>
            <select
              value={guidelineId}
              onChange={(e) => setGuidelineId(e.target.value)}
              className="w-full p-3 border rounded-md"
              required
            >
              <option value="">가이드라인을 선택하세요</option>
              {guidelines.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="체크리스트 제목"
              className="w-full p-3 border rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-accent text-white px-6 py-3 rounded-md hover:bg-accent/80 disabled:opacity-50"
          >
            {submitting ? "추가 중..." : "체크리스트 추가"}
          </button>
        </form>
      </div>

      <div className="bg-surface rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-bold mb-4 text-primary-dark">
          등록된 체크리스트
        </h2>

        {loading ? (
          <div className="text-center py-8 text-beige">로딩 중...</div>
        ) : checklists.length === 0 ? (
          <div className="text-center py-8 text-primary-dark/60">
            <p className="text-lg">등록된 체크리스트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {checklists.map((checklist) => (
              <div
                key={checklist.id}
                className="flex items-center justify-between p-4 bg-white rounded-md border"
              >
                <div className="flex-1">
                  <div className="font-medium text-primary-dark">
                    {checklist.title}
                  </div>
                  {checklist.guideline && (
                    <div className="text-sm text-gray-600 mt-1">
                      가이드라인: {checklist.guideline.title}
                    </div>
                  )}
                </div>
                <button
                  onClick={async () => {
                    if (
                      window.confirm(
                        `'${checklist.title}' 체크리스트를 삭제하시겠습니까?`
                      )
                    ) {
                      try {
                        await adminApi.deleteAdminChecklist(checklist.id);
                        await loadChecklists();
                        alert("체크리스트가 삭제되었습니다.");
                      } catch (error: any) {
                        console.error("체크리스트 삭제 실패:", error);
                        alert(
                          error.response?.data?.message ||
                            "체크리스트 삭제에 실패했습니다."
                        );
                      }
                    }
                  }}
                  className="text-red-500 hover:text-red-700 px-3 py-1 rounded"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
