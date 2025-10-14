import { Service, GuidelineDetail } from '../types/guideline';

// TODO: axios 설정으로 변경
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const adminApi = {
  // 어드민 로그인
  login: async (username: string, password: string): Promise<boolean> => {
    // TODO: 실제 API 호출로 변경
    return username === 'admin' && password === 'admin123';
  },

  // 서비스 관리
  getServices: async (): Promise<Service[]> => {
    // TODO: 실제 API 호출로 변경
    // const response = await fetch(`${API_BASE_URL}/admin/services`);
    // return response.json();
    
    const saved = localStorage.getItem('admin_services');
    return saved ? JSON.parse(saved) : [];
  },

  saveService: async (service: Service): Promise<void> => {
    // TODO: 실제 API 호출로 변경
    // await fetch(`${API_BASE_URL}/admin/services`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(service)
    // });
    
    const services = await adminApi.getServices();
    const updated = [...services, service];
    localStorage.setItem('admin_services', JSON.stringify(updated));
  },

  deleteService: async (serviceId: string): Promise<void> => {
    // TODO: 실제 API 호출로 변경
    // await fetch(`${API_BASE_URL}/admin/services/${serviceId}`, {
    //   method: 'DELETE'
    // });
    
    const services = await adminApi.getServices();
    const updated = services.filter(s => s.id !== serviceId);
    localStorage.setItem('admin_services', JSON.stringify(updated));
  },

  // 가이드라인 관리
  getGuidelines: async (): Promise<GuidelineDetail[]> => {
    // TODO: 실제 API 호출로 변경
    // const response = await fetch(`${API_BASE_URL}/admin/guidelines`);
    // return response.json();
    
    const saved = localStorage.getItem('admin_detailed_guidelines');
    return saved ? JSON.parse(saved) : [];
  },

  saveGuideline: async (guideline: GuidelineDetail): Promise<void> => {
    // TODO: 실제 API 호출로 변경
    // await fetch(`${API_BASE_URL}/admin/guidelines`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(guideline)
    // });
    
    const guidelines = await adminApi.getGuidelines();
    const updated = [...guidelines, guideline];
    localStorage.setItem('admin_detailed_guidelines', JSON.stringify(updated));
  },

  deleteGuideline: async (guidelineId: string): Promise<void> => {
    // TODO: 실제 API 호출로 변경
    // await fetch(`${API_BASE_URL}/admin/guidelines/${guidelineId}`, {
    //   method: 'DELETE'
    // });
    
    const guidelines = await adminApi.getGuidelines();
    const updated = guidelines.filter(g => g.id !== guidelineId);
    localStorage.setItem('admin_detailed_guidelines', JSON.stringify(updated));
  }
};