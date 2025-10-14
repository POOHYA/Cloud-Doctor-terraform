import { useState } from 'react';
import { GuidelineDetail, Service } from '../../types/guideline';

const PRIORITY_OPTIONS = [
  { value: 'confirm', label: '확인요망', color: 'bg-blue-100 text-blue-800' },
  { value: 'important', label: '중요', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'urgent', label: '긴급', color: 'bg-red-100 text-red-800' }
] as const;

interface GuidelineFormProps {
  services: Service[];
  initialData?: GuidelineDetail | null;
  onSave: (guideline: Omit<GuidelineDetail, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function GuidelineForm({ services, initialData, onSave, onCancel }: GuidelineFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    serviceId: initialData?.serviceId || '',
    serviceName: initialData?.serviceName || '',
    priority: (initialData?.priority || 'confirm') as const,
    content: {
      whyDangerous: initialData?.content.whyDangerous || '',
      whatHappens: initialData?.content.whatHappens || '',
      checkCriteria: initialData?.content.checkCriteria || '',
      checkImages: initialData?.content.checkImages || [],
      sideEffect: initialData?.content.sideEffect || ''
    },
    uncheckedCases: initialData?.uncheckedCases || [''],
    notes: initialData?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addUncheckedCase = () => {
    setFormData(prev => ({
      ...prev,
      uncheckedCases: [...prev.uncheckedCases, '']
    }));
  };

  const updateUncheckedCase = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      uncheckedCases: prev.uncheckedCases.map((item, i) => i === index ? value : item)
    }));
  };

  const removeUncheckedCase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uncheckedCases: prev.uncheckedCases.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {initialData ? '가이드라인 수정' : '새 가이드라인 작성'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium mb-2">제목 (항목명)</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-3 border rounded-md"
            required
          />
        </div>

        {/* 서비스 선택 */}
        <div>
          <label className="block text-sm font-medium mb-2">서비스 선택</label>
          <select
            value={formData.serviceId}
            onChange={(e) => {
              const selectedService = services.find(s => s.id === e.target.value);
              setFormData(prev => ({ 
                ...prev, 
                serviceId: e.target.value,
                serviceName: selectedService?.name || ''
              }));
            }}
            className="w-full p-3 border rounded-md"
            required
          >
            <option value="">서비스를 선택하세요</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        {/* 중요도 */}
        <div>
          <label className="block text-sm font-medium mb-2">중요도</label>
          <div className="flex gap-4">
            {PRIORITY_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                className={`px-4 py-2 rounded-md border ${
                  formData.priority === option.value 
                    ? `${option.color} border-current` 
                    : 'bg-gray-100 border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 항목 상세 내용 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">항목 상세 내용</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">• 왜 위험한가?</label>
              <textarea
                value={formData.content.whyDangerous}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  content: { ...prev.content, whyDangerous: e.target.value }
                }))}
                className="w-full p-3 border rounded-md h-24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">• 어떤 일이 벌어질까?</label>
              <textarea
                value={formData.content.whatHappens}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  content: { ...prev.content, whatHappens: e.target.value }
                }))}
                className="w-full p-3 border rounded-md h-24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">• 점검 기준</label>
              <textarea
                value={formData.content.checkCriteria}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  content: { ...prev.content, checkCriteria: e.target.value }
                }))}
                className="w-full p-3 border rounded-md h-24"
                required
              />
            </div>
          </div>
        </div>

        {/* 조치 방안 */}
        <div>
          <label className="block text-sm font-medium mb-2">조치 방안</label>
          <div className="border rounded-md">
            <div className="p-2 border-b bg-gray-50 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const textarea = document.getElementById('actionPlan') as HTMLTextAreaElement;
                        const cursorPos = textarea.selectionStart;
                        const textBefore = textarea.value.substring(0, cursorPos);
                        const textAfter = textarea.value.substring(cursorPos);
                        const newValue = textBefore + `\n[이미지: ${file.name}]\n` + textAfter;
                        setFormData(prev => ({
                          ...prev,
                          content: { ...prev.content, sideEffect: newValue }
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                이미지 삽입
              </button>
              <span className="text-xs text-gray-500 self-center">커서 위치에 이미지가 삽입됩니다</span>
            </div>
            <textarea
              id="actionPlan"
              value={formData.content.sideEffect}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                content: { ...prev.content, sideEffect: e.target.value }
              }))}
              className="w-full p-3 border-0 rounded-b-md h-32 resize-none"
              placeholder="조치 방안을 작성하고, '이미지 삽입' 버튼으로 이미지를 추가하세요."
              required
            />
          </div>
        </div>

        {/* Side-effect */}
        <div>
          <label className="block text-sm font-medium mb-2">Side-effect</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full p-3 border rounded-md h-24"
          />
        </div>

        {/* 미조치 사례 */}
        <div>
          <label className="block text-sm font-medium mb-2">미조치 사례 (링크)</label>
          {formData.uncheckedCases.map((caseLink, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                value={caseLink}
                onChange={(e) => updateUncheckedCase(index, e.target.value)}
                placeholder="https://example.com"
                className="flex-1 p-2 border rounded-md"
              />
              {formData.uncheckedCases.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUncheckedCase(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addUncheckedCase}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            링크 추가
          </button>
        </div>

        {/* 비고 */}
        <div>
          <label className="block text-sm font-medium mb-2">비고</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full p-3 border rounded-md h-24"
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            {initialData ? '가이드라인 수정' : '가이드라인 저장'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}