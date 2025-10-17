import { useState } from 'react';
import CloudProviderSelector from './CloudProviderSelector';
import ServiceManagement from './ServiceManagement';
import GuidelineManagement from './GuidelineManagement';

interface AdminDashboardProps {
  adminUser: string;
  onLogout: () => void;
}

export default function AdminDashboard({ adminUser, onLogout }: AdminDashboardProps) {
  const [selectedProvider, setSelectedProvider] = useState<{ id: number; name: string } | null>(null);
  const [selectedService, setSelectedService] = useState<{ id: number; name: string } | null>(null);

  const handleProviderSelect = (providerId: number, providerName: string) => {
    setSelectedProvider({ id: providerId, name: providerName });
    setSelectedService(null);
  };

  const handleServiceSelect = (serviceId: number, serviceName: string) => {
    setSelectedService({ id: serviceId, name: serviceName });
  };

  const handleBack = () => {
    if (selectedService) {
      setSelectedService(null);
    } else {
      setSelectedProvider(null);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">환영합니다, {adminUser}님</span>
              <button 
                onClick={onLogout} 
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {!selectedProvider ? (
          <CloudProviderSelector onProviderSelect={handleProviderSelect} />
        ) : !selectedService ? (
          <ServiceManagement 
            providerId={selectedProvider.id}
            providerName={selectedProvider.name}
            onBack={handleBack}
            onServiceSelect={handleServiceSelect}
          />
        ) : (
          <GuidelineManagement
            providerId={selectedProvider.id}
            providerName={selectedProvider.name}
            serviceId={selectedService.id}
            serviceName={selectedService.name}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}