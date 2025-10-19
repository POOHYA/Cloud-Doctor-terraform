import React, { useState, useEffect } from 'react';
import { GuidelineDetail } from '../../types/guideline';
import { adminApi } from '../../api/admin';

interface Props {
  guideline: GuidelineDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<GuidelineDetail>) => void;
}

export const GuidelineDetailModal: React.FC<Props> = ({
  guideline,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState<Partial<GuidelineDetail>>({});
  const [links, setLinks] = useState<{title: string, url: string}[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  useEffect(() => {
    if (guideline) {
      setFormData(guideline);
      setSelectedServiceId(Number(guideline.serviceId) || null);
      // uncheckedCases가 문자열 배열이면 객체 배열로 변환
      const convertedLinks = (guideline.uncheckedCases || []).map(item => 
        typeof item === 'string' ? {title: '', url: item} : item
      );
      setLinks(convertedLinks);
      loadServices();
    }
  }, [guideline]);

  const loadServices = async () => {
    try {
      // 가이드라인에서 cloudProviderId를 추출해야 함
      const cloudProviderId = 1; // 임시로 AWS로 설정, 실제로는 guideline에서 가져와야 함
      const data = await adminApi.getServicesByProvider(cloudProviderId);
      setServices(data);
    } catch (error) {
      console.error('서비스 로드 실패:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guideline && selectedServiceId) {
      onUpdate(guideline.id, { ...formData, serviceId: selectedServiceId.toString(), links });
    }
  };

  const addLink = () => {
    setLinks([...links, {title: '', url: ''}]);
  };

  const updateLink = (index: number, field: 'title' | 'url', value: string) => {
    const updated = links.map((link, i) => 
      i === index ? {...link, [field]: value} : link
    );
    setLinks(updated);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  if (!isOpen || !guideline) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">가이드라인 수정</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">서비스</label>
            <select
              value={selectedServiceId || ''}
              onChange={(e) => setSelectedServiceId(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
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
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">중요도</label>
            <select
              value={formData.priority || ''}
              onChange={(e) => setFormData({...formData, priority: e.target.value as 'confirm' | 'important' | 'urgent'})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="confirm">확인요망</option>
              <option value="important">중요</option>
              <option value="urgent">긴급</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">위험한 이유</label>
            <textarea
              value={formData.content?.whyDangerous || ''}
              onChange={(e) => setFormData({...formData, content: {
                whyDangerous: e.target.value,
                whatHappens: formData.content?.whatHappens || '',
                checkCriteria: formData.content?.checkCriteria || '',
                solutionText: formData.content?.solutionText || '',
                sideEffect: formData.content?.sideEffect || '',
                checkImages: formData.content?.checkImages
              }})}
              className="w-full border rounded px-3 py-2 h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">발생 가능한 문제</label>
            <textarea
              value={formData.content?.whatHappens || ''}
              onChange={(e) => setFormData({...formData, content: {
                whyDangerous: formData.content?.whyDangerous || '',
                whatHappens: e.target.value,
                checkCriteria: formData.content?.checkCriteria || '',
                solutionText: formData.content?.solutionText || '',
                sideEffect: formData.content?.sideEffect || '',
                checkImages: formData.content?.checkImages
              }})}
              className="w-full border rounded px-3 py-2 h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">점검 기준</label>
            <textarea
              value={formData.content?.checkCriteria || ''}
              onChange={(e) => setFormData({...formData, content: {
                whyDangerous: formData.content?.whyDangerous || '',
                whatHappens: formData.content?.whatHappens || '',
                checkCriteria: e.target.value,
                solutionText: formData.content?.solutionText || '',
                sideEffect: formData.content?.sideEffect || '',
                checkImages: formData.content?.checkImages
              }})}
              className="w-full border rounded px-3 py-2 h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">조치 방안</label>
            <textarea
              value={formData.content?.solutionText || ''}
              onChange={(e) => setFormData({...formData, content: {
                whyDangerous: formData.content?.whyDangerous || '',
                whatHappens: formData.content?.whatHappens || '',
                checkCriteria: formData.content?.checkCriteria || '',
                solutionText: e.target.value,
                sideEffect: formData.content?.sideEffect || '',
                checkImages: formData.content?.checkImages
              }})}
              className="w-full border rounded px-3 py-2 h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">부작용</label>
            <textarea
              value={formData.content?.sideEffect || ''}
              onChange={(e) => setFormData({...formData, content: {
                whyDangerous: formData.content?.whyDangerous || '',
                whatHappens: formData.content?.whatHappens || '',
                checkCriteria: formData.content?.checkCriteria || '',
                solutionText: formData.content?.solutionText || '',
                sideEffect: e.target.value,
                checkImages: formData.content?.checkImages
              }})}
              className="w-full border rounded px-3 py-2 h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">비고</label>
            <textarea
              value={formData.note1 || ''}
              onChange={(e) => setFormData({...formData, note1: e.target.value})}
              className="w-full border rounded px-3 py-2 h-24"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">참고 링크</label>
              <button
                type="button"
                onClick={addLink}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                링크 추가
              </button>
            </div>
            {links.map((link, index) => (
              <div key={index} className="border rounded p-3 mb-2">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="사례 제목"
                    value={link.title}
                    onChange={(e) => updateLink(index, 'title', e.target.value)}
                    className="flex-1 border rounded px-2 py-1"
                  />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                    className="flex-1 border rounded px-2 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};