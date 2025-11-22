import { useState } from "react";
import CloudProviderSelector from "./CloudProviderSelector";
import ServiceManagement from "./ServiceManagement";
import GuidelineManagement from "./GuidelineManagement";
import ChecklistGenerator from "./ChecklistGenerator";

interface AdminDashboardProps {
  adminUser: string;
  onLogout: () => void;
}

export default function AdminDashboard({
  adminUser,
  onLogout,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "service" | "guideline" | "checklist"
  >("service");
  const [selectedProvider, setSelectedProvider] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedService, setSelectedService] = useState<{
    id: number;
    name: string;
  } | null>(null);

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
    <div className="min-h-screen bg-primary-dark">
      {/* 헤더 */}
      <div className="bg-primary shadow-sm border-b border-primary-light/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-beige">
              CloudDoctor 관리자 대시보드
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-beige/80">환영합니다, {adminUser}님</span>
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
        ) : (
          <>
            {/* 탭 메뉴 */}
            <div className="flex gap-2 mb-6 border-b border-primary-light/20">
              <button
                onClick={() => setActiveTab("service")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "service"
                    ? "border-b-2 border-accent text-accent"
                    : "text-beige/70 hover:text-beige"
                }`}
              >
                서비스 관리
              </button>
              <button
                onClick={() => setActiveTab("guideline")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "guideline"
                    ? "border-b-2 border-accent text-accent"
                    : "text-beige/70 hover:text-beige"
                }`}
              >
                가이드라인 관리
              </button>
              <button
                onClick={() => setActiveTab("checklist")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "checklist"
                    ? "border-b-2 border-accent text-accent"
                    : "text-beige/70 hover:text-beige"
                }`}
              >
                체크리스트 생성
              </button>
            </div>

            {/* 탭 콘텐츠 */}
            {activeTab === "service" && (
              <ServiceManagement
                providerId={selectedProvider.id}
                providerName={selectedProvider.name}
                onBack={handleBack}
                onServiceSelect={handleServiceSelect}
              />
            )}
            {activeTab === "guideline" && (
              <GuidelineManagement
                providerId={selectedProvider.id}
                providerName={selectedProvider.name}
              />
            )}
            {activeTab === "checklist" && <ChecklistGenerator providerName={selectedProvider.name} providerId={selectedProvider.id} />}
          </>
        )}
      </div>
    </div>
  );
}
