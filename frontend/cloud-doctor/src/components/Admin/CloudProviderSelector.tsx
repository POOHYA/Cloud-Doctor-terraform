import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';

interface CloudProvider {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
}

interface CloudProviderSelectorProps {
  onProviderSelect: (providerId: number, providerName: string) => void;
}

export default function CloudProviderSelector({ onProviderSelect }: CloudProviderSelectorProps) {
  const [providers, setProviders] = useState<CloudProvider[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">클라우드 서비스 제공업체 선택</h1>
        <p className="text-gray-600">서비스를 관리할 클라우드 제공업체를 선택해주세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map(provider => (
          <button
            key={provider.id}
            onClick={() => onProviderSelect(provider.id, provider.name)}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500 group"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2 group-hover:text-blue-600">
                {provider.name}
              </div>
              <div className="text-lg text-gray-600">
                {provider.displayName}
              </div>
              <div className="mt-4 text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                클릭하여 선택
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}