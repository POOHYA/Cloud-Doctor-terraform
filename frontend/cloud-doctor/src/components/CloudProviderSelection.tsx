import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin';

interface CloudProvider {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
}

export default function CloudProviderSelection() {
  const [providers, setProviders] = useState<CloudProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const data = await adminApi.getProviders();
      setProviders(data);
    } catch (error) {
      console.error('프로바이더 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (providerId: number, providerName: string) => {
    navigate(`/guide/${providerId}`, { 
      state: { 
        providerId, 
        providerName 
      } 
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
            <h1 className="text-2xl font-bold text-gray-900">Cloud Service Provider</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              홈으로
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            클라우드 서비스 제공업체 선택
          </h1>
          <p className="text-xl text-gray-600">
            보안 가이드를 확인할 클라우드 제공업체를 선택해주세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {providers.map(provider => (
            <button
              key={provider.id}
              onClick={() => handleProviderSelect(provider.id, provider.name)}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 group transform hover:-translate-y-1"
            >
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors">
                  {provider.name}
                </div>
                <div className="text-xl text-gray-600 mb-4">
                  {provider.displayName}
                </div>
                <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  클릭하여 선택 →
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500">
            각 클라우드 제공업체별 보안 가이드라인과 체크리스트를 제공합니다
          </p>
        </div>
      </div>
    </div>
  );
}