import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { adminApi } from '../api/admin';

export default function ChecklistNew() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [checklistName, setChecklistName] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
    if (editId) {
      loadChecklist(parseInt(editId));
    }
  }, [editId]);

  useEffect(() => {
    if (selectedProvider) {
      loadServices(selectedProvider);
    }
  }, [selectedProvider]);

  useEffect(() => {
    if (selectedServices.length > 0) {
      loadGuidelines();
    }
  }, [selectedServices]);

  const loadProviders = async () => {
    try {
      const data = await adminApi.getProviders();
      setProviders(data);
      if (data.length > 0 && !selectedProvider) {
        setSelectedProvider(data[0].id);
      }
    } catch (error) {
      console.error('제공업체 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async (providerId: number) => {
    try {
      const data = await adminApi.getServicesByProvider(providerId);
      setServices(data);
      setSelectedServices([]);
      setGuidelines([]);
      setChecklists([]);
    } catch (error) {
      console.error('서비스 로드 실패:', error);
    }
  };

  const loadGuidelines = async () => {
    try {
      const allGuidelines: any[] = [];
      const allChecklists: any[] = [];
      
      for (const serviceId of selectedServices) {
        const guidelineData = await adminApi.getGuidelinesByService(serviceId);
        allGuidelines.push(...guidelineData);
        
        for (const guideline of guidelineData) {
          const checklistData = await adminApi.getChecklistsByGuideline(guideline.id);
          allChecklists.push(...checklistData);
        }
      }
      
      setGuidelines(allGuidelines);
      setChecklists(allChecklists);
    } catch (error) {
      console.error('가이드라인 로드 실패:', error);
    }
  };

  const loadChecklist = async (id: number) => {
    try {
      const detail = await adminApi.getChecklistDetail(id);
      setChecklistName(detail.resultName);
      setAnswers(JSON.parse(detail.notes));
      setIsEditMode(true);
    } catch (error) {
      console.error('체크리스트 로드 실패:', error);
    }
  };

  const toggleService = (serviceId: number) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const totalItems = checklists.length;
  const scorePerItem = totalItems > 0 ? 10 / totalItems : 0;
  const totalScore = checklists.reduce((score, item) => {
    return answers[item.id] === true ? score + scorePerItem : score;
  }, 0);

  if (loading) {
    return <div className="py-12 text-center">로딩 중...</div>;
  }

  return (
    <section className="py-12 bg-gray-100">
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          보안 체크리스트
        </h1>

        {/* 클라우드 제공업체 선택 */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">클라우드 제공업체</h2>
          <div className="flex gap-2">
            {providers.map((provider) => (
              <button
                key={provider.id}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedProvider === provider.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => setSelectedProvider(provider.id)}
              >
                {provider.displayName}
              </button>
            ))}
          </div>
        </div>

        {/* 서비스 선택 */}
        {services.length > 0 && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">서비스 선택</h2>
            <div className="flex flex-wrap gap-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedServices.includes(service.id)
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() => toggleService(service.id)}
                >
                  {service.displayName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 체크리스트 테이블 */}
        {checklists.length > 0 ? (
          <>
            <table className="table-auto w-full border-collapse border border-gray-300 shadow-sm rounded-lg overflow-hidden bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border border-gray-300 p-3 text-left">항목</th>
                  <th className="border border-gray-300 p-3 text-center">체크</th>
                </tr>
              </thead>
              <tbody>
                {checklists.map((item) => {
                  const answer = answers[item.id];
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3">{item.title}</td>
                      <td className="border border-gray-300 p-3 text-center flex justify-center gap-2">
                        <button
                          className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                            answer === true
                              ? "bg-green-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-green-100"
                          }`}
                          onClick={() => setAnswers({ ...answers, [item.id]: true })}
                        >
                          O
                        </button>
                        <button
                          className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                            answer === false
                              ? "bg-red-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-red-100"
                          }`}
                          onClick={() => setAnswers({ ...answers, [item.id]: false })}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-6 text-right text-lg font-semibold text-gray-800">
              총점: <span className="text-blue-600">{totalScore.toFixed(2)}</span> / 10 점
            </div>

            <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">체크리스트 저장</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={checklistName}
                  onChange={(e) => setChecklistName(e.target.value)}
                  placeholder="체크리스트 제목 입력"
                  className="flex-1 p-3 border rounded-md"
                />
                <button
                  onClick={async () => {
                    if (!checklistName.trim()) {
                      alert('제목을 입력해주세요.');
                      return;
                    }
                    setSaving(true);
                    try {
                      if (isEditMode && editId) {
                        await adminApi.updateChecklist(parseInt(editId), checklistName, answers);
                        alert('체크리스트가 수정되었습니다.');
                      } else {
                        await adminApi.saveChecklist(checklistName, answers);
                        alert('체크리스트가 저장되었습니다.');
                        setChecklistName('');
                        setAnswers({});
                      }
                    } catch (error) {
                      alert('저장에 실패했습니다. 로그인이 필요합니다.');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? '저장 중...' : isEditMode ? '수정' : '저장'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {selectedServices.length === 0 
              ? '서비스를 선택해주세요.' 
              : '선택한 서비스에 체크리스트가 없습니다.'}
          </div>
        )}
      </div>
    </section>
  );
}
