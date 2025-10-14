import { useState, useEffect } from 'react';

export default function GuidelineDisplay() {
  const [guidelines, setGuidelines] = useState<string[]>([]);

  useEffect(() => {
    const loadGuidelines = () => {
      const saved = localStorage.getItem('admin_guidelines');
      setGuidelines(saved ? JSON.parse(saved) : []);
    };

    loadGuidelines();
    
    // localStorage 변경 감지
    const handleStorageChange = () => {
      loadGuidelines();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 같은 탭에서의 변경도 감지하기 위한 커스텀 이벤트
    window.addEventListener('guidelinesUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('guidelinesUpdated', handleStorageChange);
    };
  }, []);

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