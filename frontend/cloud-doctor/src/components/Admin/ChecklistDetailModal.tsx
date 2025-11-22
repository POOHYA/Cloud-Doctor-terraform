import { useState, useEffect } from "react";
import { adminApi } from "../../api/admin";

interface ChecklistDetailModalProps {
  checklistId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ChecklistDetailModal({
  checklistId,
  isOpen,
  onClose,
  onUpdate,
}: ChecklistDetailModalProps) {
  const [checklist, setChecklist] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedGuidelineId, setSelectedGuidelineId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && checklistId) {
      loadChecklist();
    }
  }, [isOpen, checklistId]);

  const loadChecklist = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getChecklist(checklistId);
      setChecklist(data);
      setTitle(data.title);
      setIsActive(data.isActive);
      setSelectedServiceId(data.serviceListId);
      setSelectedGuidelineId(data.guidelineId);
      
      // 서비스 목록 로드
      const servicesData = await adminApi.getServicesByProvider(data.cloudProviderId);
      setServices(servicesData);
      
      // 가이드라인 목록 로드
      if (data.serviceListId) {
        const guidelinesData = await adminApi.getGuidelinesByService(data.serviceListId);
        setGuidelines(guidelinesData);
      }
    } catch (error) {
      console.error("체크리스트 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGuidelines = async (serviceId: number) => {
    try {
      const data = await adminApi.getGuidelinesByService(serviceId);
      setGuidelines(data);
    } catch (error) {
      console.error("가이드라인 로드 실패:", error);
    }
  };

  const handleServiceChange = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setSelectedGuidelineId(null);
    setGuidelines([]);
    if (serviceId) {
      loadGuidelines(serviceId);
    }
  };

  const handleSave = async () => {
    if (!selectedServiceId || !selectedGuidelineId) {
      alert('서비스와 가이드라인을 선택해주세요.');
      return;
    }
    
    setSaving(true);
    try {
      await adminApi.updateChecklist(checklistId, {
        title: title.trim(),
        isActive,
        serviceListId: selectedServiceId,
        guidelineId: selectedGuidelineId,
      });
      onUpdate();
      onClose();
      alert("체크리스트가 수정되었습니다.");
    } catch (error: any) {
      console.error("체크리스트 수정 실패:", error);
      alert(error.response?.data?.message || "체크리스트 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-dark">체크리스트 상세</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : checklist ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">체크리스트 제목 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">클라우드 제공업체</label>
              <input
                type="text"
                value={checklist.cloudProviderName || ""}
                className="w-full p-3 border rounded-md bg-gray-100"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">서비스 *</label>
              <select
                value={selectedServiceId || ''}
                onChange={(e) => handleServiceChange(Number(e.target.value))}
                className="w-full p-3 border rounded-md"
                required
              >
                <option value="">서비스를 선택하세요</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.displayName || service.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">가이드라인 *</label>
              <select
                value={selectedGuidelineId || ''}
                onChange={(e) => setSelectedGuidelineId(Number(e.target.value))}
                className="w-full p-3 border rounded-md"
                required
                disabled={!selectedServiceId}
              >
                <option value="">가이드라인을 선택하세요</option>
                {guidelines.map((guideline) => (
                  <option key={guideline.id} value={guideline.id}>
                    {guideline.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="mr-2"
                />
                체크리스트 항목 클라이언트 페이지에 표시하기
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim() || !selectedServiceId || !selectedGuidelineId}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/80 disabled:opacity-50"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-red-500">
            체크리스트를 불러올 수 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}