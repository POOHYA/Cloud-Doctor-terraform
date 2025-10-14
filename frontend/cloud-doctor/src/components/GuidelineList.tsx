import { useGuidelines } from '../hooks/useGuidelines';

export default function GuidelineList() {
  const { guidelines, loading } = useGuidelines();

  if (loading) {
    return (
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse">가이드라인 로딩 중...</div>
      </div>
    );
  }

  if (guidelines.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-blue-800">📋 보안 가이드라인</h3>
      <ul className="space-y-2">
        {guidelines.map((guideline, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span className="text-blue-700">{guideline}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}