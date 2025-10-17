import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';

export default function ServiceManagement() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getServices();
      setServices(data);
    } catch (error) {
      console.error('서비스 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">서비스 관리</h1>
      
      {loading ? (
        <p className="text-center py-8">로딩 중...</p>
      ) : services.length === 0 ? (
        <p className="text-gray-500 text-center py-8">등록된 서비스가 없습니다.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">서비스명</th>
                <th className="px-6 py-3 text-left">표시명</th>
                <th className="px-6 py-3 text-left">클라우드</th>
                <th className="px-6 py-3 text-center">상태</th>
                <th className="px-6 py-3 text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{service.name}</td>
                  <td className="px-6 py-4">{service.displayName}</td>
                  <td className="px-6 py-4">{service.cloudProvider?.displayName}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {service.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-blue-600 hover:underline mr-3">수정</button>
                    <button className="text-red-600 hover:underline">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
