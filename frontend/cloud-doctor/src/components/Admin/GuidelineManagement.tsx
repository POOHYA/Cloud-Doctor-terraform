import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { GuidelineDetailModal } from './GuidelineDetailModal';

interface Guideline {
  id: number;
  title: string;
  importanceLevel: string;
  whyDangerous: string;
  whatHappens: string;
  checkCriteria: string;
}

interface GuidelineManagementProps {
  providerId: number;
  providerName: string;
  serviceId?: number;
  serviceName?: string;
}

export default function GuidelineManagement({ 
  providerId, 
  providerName, 
  serviceId, 
  serviceName
}: GuidelineManagementProps) {
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuideline, setSelectedGuideline] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(serviceId || null);
  const [filteredGuidelines, setFilteredGuidelines] = useState<Guideline[]>([]);

  useEffect(() => {
    loadServices();
    loadGuidelines();
  }, [providerId]);

  useEffect(() => {
    filterGuidelines();
  }, [guidelines, selectedServiceId]);

  const loadServices = async () => {
    try {
      const data = await adminApi.getServicesByProvider(providerId);
      setServices(data);
    } catch (error) {
      console.error('서비스 로드 실패:', error);
    }
  };

  const loadGuidelines = async () => {
    try {
      const data = await adminApi.getGuidelines();
      console.log('All guidelines data:', data);
      setGuidelines(data);
    } catch (error) {
      console.error('가이드라인 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterGuidelines = () => {
    if (selectedServiceId) {
      const filtered = guidelines.filter(g => g.serviceListId === selectedServiceId);
      setFilteredGuidelines(filtered);
    } else {
      setFilteredGuidelines(guidelines);
    }
  };

  const getGuidelineById = async (id: number) => {
    try {
      const guideline = await adminApi.getGuideline(id);
      console.log('Selected guideline:', guideline);
      
      // 데이터 구조 변환 - 백엔드 응답에 맞게 수정
      const convertedGuideline = {
        id: guideline.id.toString(),
        title: guideline.title || '',
        serviceId: guideline.serviceListId?.toString() || '',
        serviceName: serviceName,
        priority: guideline.importanceLevel === '긴급' ? 'urgent' : 
                 guideline.importanceLevel === '중요' ? 'important' : 
                 guideline.importanceLevel === 'urgent' ? 'urgent' :
                 guideline.importanceLevel === 'important' ? 'important' : 'confirm',
        content: {
          whyDangerous: guideline.whyDangerous || '',
          whatHappens: guideline.whatHappens || '',
          checkCriteria: guideline.checkStandard || '',
          solutionText: guideline.solutionText || '',
          sideEffect: guideline.sideEffects || '',
          checkImages: []
        },
        uncheckedCases: (guideline.links || []).map(link => 
          typeof link === 'string' ? {title: '', url: link} : link
        ),
        note1: guideline.note || '',
        note2: '',
        createdAt: guideline.createdAt || new Date().toISOString()
      };
      
      setSelectedGuideline(convertedGuideline);
      setIsModalOpen(true);
    } catch (error) {
      console.error('가이드라인 상세 조회 실패:', error);
    }
  };

  const updateGuideline = async (id: string, data: any) => {
    try {
      const updateData = {
        title: data.title || '',
        cloudProviderId: providerId,
        serviceListId: data.serviceId ? Number(data.serviceId) : selectedServiceId,
        importanceLevel: data.priority === 'urgent' ? '긴급' : data.priority === 'important' ? '중요' : '확인요망',
        whyDangerous: data.content?.whyDangerous || '',
        whatHappens: data.content?.whatHappens || '',
        checkStandard: data.content?.checkCriteria || '',
        solutionText: data.content?.solutionText || '',
        sideEffects: data.content?.sideEffect || '',
        note: data.note1 || '',
        links: data.links || []
      };
      
      console.log('Update data:', updateData); // 디버깅용
      await adminApi.updateGuideline(Number(id), updateData);
      await loadGuidelines();
      setIsModalOpen(false);
      setSelectedGuideline(null);
    } catch (error) {
      console.error('가이드라인 수정 실패:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGuideline(null);
  };
  const [formData, setFormData] = useState({
    title: '',
    importanceLevel: '확인요망',
    whyDangerous: '',
    whatHappens: '',
    checkStandard: '',
    solutionText: '',
    sideEffects: '',
    note: ''
  });
  const [links, setLinks] = useState<{title: string, url: string}[]>([{title: '', url: ''}]);



  const addLink = () => {
    setLinks([...links, {title: '', url: ''}]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLinkField = (index: number, field: 'title' | 'url', value: string) => {
    const updatedLinks = links.map((link, i) => 
      i === index ? {...link, [field]: value} : link
    );
    setLinks(updatedLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedServiceId) {
        alert('서비스를 선택해주세요.');
        return;
      }
      
      await adminApi.createGuideline({
        ...formData,
        cloudProviderId: providerId,
        serviceListId: selectedServiceId,
        links: links.filter(link => link.url.trim() !== '')
      });
      
      setFormData({
        title: '',
        importanceLevel: '확인요망',
        whyDangerous: '',
        whatHappens: '',
        checkStandard: '',
        solutionText: '',
        sideEffects: '',
        note: ''
      });
      setLinks([{title: '', url: ''}]);
      setShowForm(false);
      await loadGuidelines();
      alert('가이드라인이 추가되었습니다.');
    } catch (error: any) {
      console.error('가이드라인 추가 실패:', error);
      alert(error.response?.data?.message || '가이드라인 추가에 실패했습니다.');
    }
  };

  const handleDelete = async (guidelineId: number, title: string) => {
    if (!window.confirm(`'${title}' 가이드라인을 삭제하시겠습니까?`)) return;

    try {
      await adminApi.deleteGuideline(guidelineId.toString());
      await loadGuidelines();
      alert('가이드라인이 삭제되었습니다.');
    } catch (error: any) {
      console.error('가이드라인 삭제 실패:', error);
      alert(error.response?.data?.message || '가이드라인 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold text-beige">
          {providerName} 가이드라인 관리
        </h1>
      </div>

      <div className="bg-surface rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-dark">
            가이드라인 생성
          </h2>
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-2 text-primary-dark">서비스 필터</label>
              <select
                value={selectedServiceId || ''}
                onChange={(e) => setSelectedServiceId(e.target.value ? Number(e.target.value) : null)}
                className="p-3 border rounded-md min-w-[200px]"
              >
                <option value="">전체 서비스</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.displayName || service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-accent text-white px-6 py-3 rounded-md hover:bg-accent/80"
              >
                {showForm ? '폼 닫기' : '새 가이드라인 추가'}
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="border-t pt-6 mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-primary-dark">서비스 *</label>
              <select
                value={selectedServiceId || ''}
                onChange={(e) => setSelectedServiceId(Number(e.target.value))}
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
              <label className="block text-sm font-medium mb-2 text-primary-dark">제목</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-primary-dark">중요도</label>
              <select
                value={formData.importanceLevel}
                onChange={(e) => setFormData({...formData, importanceLevel: e.target.value})}
                className="w-full p-3 border rounded-md"
              >
                <option value="확인요망">확인요망</option>
                <option value="중요">중요</option>
                <option value="긴급">긴급</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-primary-dark">왜 위험한가?</label>
              <textarea
                value={formData.whyDangerous}
                onChange={(e) => setFormData({...formData, whyDangerous: e.target.value})}
                className="w-full p-3 border rounded-md h-24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-primary-dark">어떤 일이 발생하는가?</label>
              <textarea
                value={formData.whatHappens}
                onChange={(e) => setFormData({...formData, whatHappens: e.target.value})}
                className="w-full p-3 border rounded-md h-24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-primary-dark">점검 기준</label>
              <textarea
                value={formData.checkStandard}
                onChange={(e) => setFormData({...formData, checkStandard: e.target.value})}
                className="w-full p-3 border rounded-md h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-primary-dark">조치 방안</label>
              <textarea
                value={formData.solutionText}
                onChange={(e) => setFormData({...formData, solutionText: e.target.value})}
                className="w-full p-3 border rounded-md h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-primary-dark">부작용</label>
              <textarea
                value={formData.sideEffects}
                onChange={(e) => setFormData({...formData, sideEffects: e.target.value})}
                className="w-full p-3 border rounded-md h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-primary-dark">비고</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                className="w-full p-3 border rounded-md h-24"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-primary-dark">참고 링크</label>
                <button
                  type="button"
                  onClick={addLink}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  링크 추가
                </button>
              </div>
              {links.map((link, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="링크 제목"
                    value={typeof link === 'string' ? '' : link.title || ''}
                    onChange={(e) => updateLinkField(index, 'title', e.target.value)}
                    className="flex-1 p-2 border rounded text-sm"
                  />
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={typeof link === 'string' ? link : link.url || ''}
                    onChange={(e) => updateLinkField(index, 'url', e.target.value)}
                    className="flex-1 p-2 border rounded text-sm"
                  />
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-accent text-white px-6 py-3 rounded-md hover:bg-accent/80"
              >
                가이드라인 추가
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/80"
              >
                취소
              </button>
            </div>
          </form>
        </div>
        )}
      </div>

      <div className="bg-surface rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-primary-dark">
          등록된 가이드라인 목록
        </h2>
        
        {loading ? (
          <div className="text-center py-8 text-beige">로딩 중...</div>
        ) : filteredGuidelines.length === 0 ? (
          <div className="text-center py-8 text-primary-dark/60">
            <p className="text-lg">등록된 가이드라인이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGuidelines.map((guideline) => (
              <div 
                key={guideline.id} 
                className="flex items-center justify-between p-4 bg-primary-dark/5 rounded-md cursor-pointer hover:bg-primary-dark/10 transition-colors"
                onClick={() => getGuidelineById(guideline.id)}
              >
                <div className="flex-1">
                  <div className="font-medium text-primary-dark">
                    {guideline.title}
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      guideline.importanceLevel === '긴급' || guideline.importanceLevel === 'urgent' ? 'bg-red-100 text-red-600' :
                      guideline.importanceLevel === '중요' || guideline.importanceLevel === 'important' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {guideline.importanceLevel === '긴급' || guideline.importanceLevel === 'urgent' ? '긴급' : 
                       guideline.importanceLevel === '중요' || guideline.importanceLevel === 'important' ? '중요' : '확인요망'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    서비스: {services.find(s => s.id === guideline.serviceListId)?.displayName || services.find(s => s.id === guideline.serviceListId)?.name || '알 수 없음'}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(guideline.id, guideline.title);
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
      
      <GuidelineDetailModal
        guideline={selectedGuideline}
        isOpen={isModalOpen}
        onClose={closeModal}
        onUpdate={updateGuideline}
      />
    </div>
  );
}