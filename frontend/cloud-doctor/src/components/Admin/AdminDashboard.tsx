import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ServiceManager from './ServiceManager';
import GuidelineForm from './GuidelineForm';
import ChecklistGenerator from './ChecklistGenerator';
import { Service, GuidelineDetail, ChecklistItem } from '../../types/guideline';

interface AdminDashboardProps {
  adminUser: string;
  onLogout: () => void;
}

export default function AdminDashboard({ adminUser, onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [services, setServices] = useState<Service[]>([]);
  const [guidelines, setGuidelines] = useState<GuidelineDetail[]>([]);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [showChecklistGenerator, setShowChecklistGenerator] = useState<GuidelineDetail | null>(null);
  const [editingGuideline, setEditingGuideline] = useState<GuidelineDetail | null>(null);
  const [showGuidelineForm, setShowGuidelineForm] = useState(false);

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'confirm': return '확인요망';
      case 'important': return '중요';
      case 'urgent': return '긴급';
      default: return priority;
    }
  };
  


  const handleAddService = (serviceData: Omit<Service, 'id' | 'createdAt'>) => {
    const newService: Service = {
      ...serviceData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setServices(prev => [...prev, newService]);
  };

  const handleRemoveService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    setGuidelines(prev => prev.filter(g => g.serviceId !== id));
  };

  const getGuidelineCount = (serviceId: string) => {
    return guidelines.filter(g => g.serviceId === serviceId).length;
  };

  const handleRemoveGuideline = (guidelineId: string, title: string) => {
    const userInput = prompt(`정말 삭제하시겠습니까?\n\n"가이드라인: ${title}"\n\n삭제하려면 '확인'을 입력하세요:`);
    if (userInput === '확인') {
      setGuidelines(prev => prev.filter(g => g.id !== guidelineId));
      setChecklists(prev => prev.filter(c => c.guidelineId !== guidelineId));
    }
  };

  const handleSaveGuideline = (guidelineData: Omit<GuidelineDetail, 'id' | 'createdAt'>) => {
    const newDetailedGuideline: GuidelineDetail = {
      ...guidelineData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setGuidelines(prev => [...prev, newDetailedGuideline]);
    setShowGuidelineForm(false);
  };

  const handleUpdateGuideline = (guidelineData: Omit<GuidelineDetail, 'id' | 'createdAt'>) => {
    if (editingGuideline) {
      const updatedGuideline: GuidelineDetail = {
        ...guidelineData,
        id: editingGuideline.id,
        createdAt: editingGuideline.createdAt
      };
      setGuidelines(prev => prev.map(g => g.id === editingGuideline.id ? updatedGuideline : g));
      setEditingGuideline(null);
    }
  };

  const handleGenerateChecklist = (guideline: GuidelineDetail, checklistTitle: string) => {
    const newChecklist: ChecklistItem = {
      id: Date.now().toString(),
      guidelineId: guideline.id,
      title: checklistTitle,
      serviceId: guideline.serviceId,
      serviceName: guideline.serviceName,
      checked: false
    };
    setChecklists(prev => [...prev, newChecklist]);
  };

  if (showGuidelineForm || editingGuideline) {
    return (
      <GuidelineForm
        services={services}
        initialData={editingGuideline}
        onSave={editingGuideline ? handleUpdateGuideline : handleSaveGuideline}
        onCancel={() => {
          setEditingGuideline(null);
          setShowGuidelineForm(false);
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">환영합니다, {adminUser}님</span>
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            로그아웃
          </button>
        </div>
      </div>

      <ServiceManager
        services={services}
        onAddService={handleAddService}
        onRemoveService={handleRemoveService}
        getGuidelineCount={getGuidelineCount}
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">가이드라인 관리</h2>
          <button
            onClick={() => setShowGuidelineForm(true)}
            className="bg-green-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-md hover:bg-green-600 text-sm sm:text-base whitespace-nowrap"
            disabled={services.length === 0}
          >
            새 가이드라인 작성
          </button>
        </div>

        {services.length === 0 ? (
          <p className="text-gray-500 text-center py-8">먼저 서비스를 추가해주세요.</p>
        ) : (
          <div className="space-y-6">
            {services.map(service => {
              const serviceGuidelines = guidelines.filter(g => g.serviceId === service.id);
              return (
                <div key={service.id} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    {service.name} - {serviceGuidelines.length}개 가이드라인
                  </h3>
                  {serviceGuidelines.length === 0 ? (
                    <p className="text-gray-500 text-sm">등록된 가이드라인이 없습니다.</p>
                  ) : (
                    <div className="space-y-2">
                      {serviceGuidelines.map(guideline => {
                        const guidelineChecklists = checklists.filter(c => c.guidelineId === guideline.id);
                        return (
                          <div key={guideline.id} className="bg-gray-50 rounded p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{guideline.title}</h4>
                                  <button
                                    onClick={() => setEditingGuideline(guideline)}
                                    className="text-blue-500 hover:text-blue-700 text-xs"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={() => handleRemoveGuideline(guideline.id, guideline.title)}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                  >
                                    삭제
                                  </button>
                                </div>
                                <p className="text-sm text-gray-600">중요도: {getPriorityLabel(guideline.priority)}</p>
                                {guidelineChecklists.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-blue-600 font-medium">체크리스트:</p>
                                    <ul className="text-xs text-gray-600 ml-4">
                                      {guidelineChecklists.map(checklist => (
                                        <li key={checklist.id}>• {checklist.title}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => setShowChecklistGenerator(guideline)}
                                className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 ml-2"
                              >
                                체크리스트 생성
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showChecklistGenerator && (
        <ChecklistGenerator
          guideline={showChecklistGenerator}
          onGenerate={(title) => handleGenerateChecklist(showChecklistGenerator, title)}
          onClose={() => setShowChecklistGenerator(null)}
        />
      )}
    </div>
  );
}