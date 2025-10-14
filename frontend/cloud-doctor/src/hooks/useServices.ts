import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Service } from '../types/guideline';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = async () => {
    try {
      const data = await adminApi.getServices();
      setServices(data);
    } catch (error) {
      console.error('서비스 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const addService = async (serviceData: Omit<Service, 'id' | 'createdAt'>) => {
    const newService: Service = {
      ...serviceData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    try {
      await adminApi.saveService(newService);
      setServices(prev => [...prev, newService]);
    } catch (error) {
      console.error('서비스 추가 실패:', error);
    }
  };

  const removeService = async (serviceId: string) => {
    try {
      await adminApi.deleteService(serviceId);
      setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch (error) {
      console.error('서비스 삭제 실패:', error);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  return { services, loading, addService, removeService };
};