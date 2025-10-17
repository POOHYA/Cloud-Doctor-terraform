import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';

interface Service {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
  cloudProvider: {
    id: number;
    name: string;
    displayName: string;
  };
}

interface ServiceManagementProps {
  providerId: number;
  providerName: string;
  onBack: () => void;
  onServiceSelect?: (serviceId: number, serviceName: string) => void;
}

export default function ServiceManagement({ providerId, providerName, onBack, onServiceSelect }: ServiceManagementProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceName, setServiceName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
  }, [providerId]);

  const loadServices = async () => {
    try {
      const data = await adminApi.getServicesByProvider(providerId);
      setServices(data);
    } catch (error) {
      console.error('서비스 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    setSubmitting(true);
    try {
      await adminApi.createService({
        cloudProviderId: providerId,
        name: serviceName.trim(),
        displayName: serviceName.trim(),
        isActive: true
      });
      
      setServiceName('');
      await loadServices();
      alert('서비스가 성공적으로 추가되었습니다.');
    } catch (error: any) {
      console.error('서비스 추가 실패:', error);
      alert(error.response?.data?.message || '서비스 추가에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !serviceName.trim()) return;

    setSubmitting(true);
    try {
      await adminApi.updateService(editingService.id.toString(), {
        name: serviceName.trim(),
        displayName: serviceName.trim(),
        isActive: true
      });
      
      setEditingService(null);
      setServiceName('');
      await loadServices();
      alert('서비스가 수정되었습니다.');
    } catch (error: any) {
      console.error('서비스 수정 실패:', error);
      alert(error.response?.data?.message || '서비스 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setServiceName('');
  };

  const handleDelete = async (serviceId: number, serviceName: string) => {
    if (!window.confirm(`'${serviceName}' 서비스를 삭제하시겠습니까?`)) return;

    try {
      await adminApi.deleteService(serviceId);
      await loadServices();
      alert('서비스가 삭제되었습니다.');
    } catch (error: any) {
      console.error('서비스 삭제 실패:', error);
      alert(error.response?.data?.message || '서비스 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← 뒤로가기
        </button>
        <h1 className="text-3xl font-bold">{providerName} 서비스 관리</h1>
      </div>

      {/* 서비스 추가/수정 폼 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">
          {editingService ? '서비스 수정' : '새 서비스 추가'}
        </h2>
        <form onSubmit={editingService ? handleUpdate : handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">서비스 이름</label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="EC2, S3, RDS, Lambda, etc."
              className="w-full p-3 border rounded-md"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {submitting ? (
                editingService ? '수정 중...' : '추가 중...'
              ) : (
                editingService ? '서비스 수정' : '서비스 추가'
              )}
            </button>
            {editingService && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600"
              >
                취소
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 서비스 목록 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">등록된 서비스 목록</h2>
        
        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">추후 추가 예정입니다.</p>
            <p className="text-sm mt-2">위 폼을 사용하여 새 서비스를 추가해보세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <div className="font-medium">{service.name}</div>
                </div>
                <div className="flex gap-2">
                  {onServiceSelect && (
                    <button
                      onClick={() => onServiceSelect(service.id, service.name)}
                      className="text-green-500 hover:text-green-700 px-3 py-1 rounded"
                    >
                      가이드라인
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(service.id, service.name)}
                    className="text-red-500 hover:text-red-700 px-3 py-1 rounded"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}