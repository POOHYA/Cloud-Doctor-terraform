import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { adminApi } from "../api/admin";

interface Service {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
}

export default function ServiceList() {
  const { providerId } = useParams<{ providerId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const providerName = location.state?.providerName || "Unknown";

  useEffect(() => {
    if (providerId) {
      loadServices(parseInt(providerId));
    }
  }, [providerId]);

  const loadServices = async (id: number) => {
    try {
      const data = await adminApi.getServicesByProvider(id);
      setServices(data);
    } catch (error) {
      console.error("서비스 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (serviceId: number, serviceName: string) => {
    navigate(`/guide/${providerId}/service/${serviceId}`, {
      state: {
        providerId: parseInt(providerId!),
        providerName,
        serviceId,
        serviceName,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/guide")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 뒤로가기
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {providerName} 서비스 목록
              </h1>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-gray-900"
            >
              홈으로
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {providerName} 서비스 선택
          </h2>
          <p className="text-lg text-gray-600">
            보안 가이드를 확인할 서비스를 선택해주세요
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              추후 추가 예정입니다
            </h3>
            <p className="text-gray-500">
              {providerName} 서비스들이 곧 추가될 예정입니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() =>
                  handleServiceClick(service.id, service.displayName)
                }
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-500 group text-left"
              >
                <div className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600">
                  {service.displayName}
                </div>
                <div className="text-sm text-gray-600 mb-4">{service.name}</div>
                <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                  가이드라인 보기 →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
