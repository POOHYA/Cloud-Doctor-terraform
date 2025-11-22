import { useState, useEffect } from "react";
import { adminApi } from "../../api/admin";

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

export default function ServiceManagement({
  providerId,
  providerName,
  onBack,
  onServiceSelect,
}: ServiceManagementProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceName, setServiceName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [editServiceName, setEditServiceName] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
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
      console.error("서비스 로드 실패:", error);
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
        displayName: displayName.trim() || serviceName.trim(),
        isActive: true,
      });

      setServiceName("");
      setDisplayName("");
      await loadServices();
      alert("서비스가 성공적으로 추가되었습니다.");
    } catch (error: any) {
      console.error("서비스 추가 실패:", error);
      alert(error.response?.data?.message || "서비스 추가에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    // 수정 모드에서는 별도 상태 사용
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editServiceName.trim()) return;

    setSubmitting(true);
    try {
      await adminApi.updateService(editingService.id, {
        cloudProviderId: providerId,
        name: editServiceName.trim(),
        displayName: editDisplayName.trim() || editServiceName.trim(),
        isActive: editingService.isActive,
      });

      setEditingService(null);
      setEditServiceName("");
      setEditDisplayName("");
      await loadServices();
      alert("서비스가 성공적으로 수정되었습니다.");
    } catch (error: any) {
      console.error("서비스 수정 실패:", error);
      alert(error.response?.data?.message || "서비스 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setEditServiceName("");
    setEditDisplayName("");
  };

  const handleDelete = async (serviceId: number, serviceName: string) => {
    if (!window.confirm(`'${serviceName}' 서비스를 삭제하시겠습니까?`)) return;

    try {
      await adminApi.deleteService(serviceId);
      await loadServices();
      alert("서비스가 삭제되었습니다.");
    } catch (error: any) {
      console.error("서비스 삭제 실패:", error);
      alert(error.response?.data?.message || "서비스 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold text-beige">
          {providerName} 서비스 관리
        </h1>
      </div>

      <div className="bg-surface rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-primary-dark">
          서비스 생성
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-primary-dark">
              서비스 이름 (내부용)
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="ec2, s3, rds, lambda"
              className="w-full p-3 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-primary-dark">
              표시 이름 (사용자용)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Amazon EC2, Amazon S3, Amazon RDS"
              className="w-full p-3 border rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent text-white px-6 py-3 rounded-md hover:bg-accent/80 disabled:opacity-50"
          >
            {submitting ? "추가 중..." : "서비스 추가"}
          </button>
        </form>
      </div>

      {editingService && (
        <div className="bg-surface rounded-lg shadow-md p-6 mb-6 border-2 border-accent">
          <h2 className="text-xl font-bold mb-4 text-primary-dark">
            서비스 수정
          </h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-primary-dark">
                서비스 이름 (내부용)
              </label>
              <input
                type="text"
                value={editServiceName}
                onChange={(e) => setEditServiceName(e.target.value)}
                placeholder="ec2, s3, rds, lambda"
                className="w-full p-3 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-primary-dark">
                표시 이름 (사용자용)
              </label>
              <input
                type="text"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                placeholder="Amazon EC2, Amazon S3, Amazon RDS"
                className="w-full p-3 border rounded-md"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {submitting ? "수정 중..." : "서비스 수정"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/80"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-primary-dark">
          등록된 서비스 목록
        </h2>

        {loading ? (
          <div className="text-center py-8 text-beige">로딩 중...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-8 text-primary-dark/60">
            <p className="text-lg">등록된 서비스가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 bg-primary-dark/5 rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium text-primary-dark">
                    {service.displayName || service.name}
                    <div className="text-sm text-gray-500">({service.name})</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingService(service);
                      setEditServiceName(service.name);
                      setEditDisplayName(service.displayName || service.name);
                    }}
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
