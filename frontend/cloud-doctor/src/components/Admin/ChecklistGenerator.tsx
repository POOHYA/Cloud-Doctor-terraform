import { useState } from 'react';
import { GuidelineDetail } from '../../types/guideline';

interface ChecklistGeneratorProps {
  guideline: GuidelineDetail;
  onGenerate: (checklistTitle: string) => void;
  onClose: () => void;
}

export default function ChecklistGenerator({ guideline, onGenerate, onClose }: ChecklistGeneratorProps) {
  const [checklistTitle, setChecklistTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checklistTitle.trim()) {
      onGenerate(checklistTitle.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">체크리스트 생성</h2>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">가이드라인:</p>
          <p className="font-medium">{guideline.title}</p>
          <p className="text-sm text-gray-500">분류: {guideline.category}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              체크리스트 제목
            </label>
            <input
              type="text"
              value={checklistTitle}
              onChange={(e) => setChecklistTitle(e.target.value)}
              placeholder="예: MFA 설정 확인"
              className="w-full p-3 border rounded-md"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              생성
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}