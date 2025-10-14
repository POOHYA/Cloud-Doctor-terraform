import { useState } from 'react';

interface Service {
  id: string;
  name: string;
  createdAt: string;
}

interface ServiceManagerProps {
  services: Service[];
  onAddService: (service: Omit<Service, 'id' | 'createdAt'>) => void;
  onRemoveService: (id: string) => void;
  getGuidelineCount: (serviceId: string) => number;
}

export default function ServiceManager({ services, onAddService, onRemoveService, getGuidelineCount }: ServiceManagerProps) {
  const [serviceName, setServiceName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceName) {
      onAddService({ name: serviceName });
      setServiceName('');
    }
  };

  const handleRemove = (id: string, name: string) => {
    const guidelineCount = getGuidelineCount(id);
    
    if (guidelineCount > 0) {
      alert(`서비스에 ${guidelineCount}개의 가이드라인이 있습니다.\n먼저 모든 가이드라인을 삭제해주세요.`);
      return;
    }
    
    const userInput = prompt(`정말 삭제하시겠습니까?\n\n"${name}"\n\n삭제하려면 '확인'을 입력하세요:`);
    if (userInput === '확인') {
      onRemoveService(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">서비스 관리</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="서비스 이름 (예: EC2, S3, RDS)"
            className="flex-1 p-3 border rounded-md text-sm"
            required
          />
          
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 text-sm whitespace-nowrap"
          >
            추가
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">등록된 서비스 ({services.length}개)</h3>
        {services.length === 0 ? (
          <p className="text-gray-500">등록된 서비스가 없습니다.</p>
        ) : (
          <div className="grid gap-2">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{service.name}</span>
                </div>
                <button
                  onClick={() => handleRemove(service.id, service.name)}
                  className="text-red-500 hover:text-red-700 text-sm ml-2 flex-shrink-0"
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