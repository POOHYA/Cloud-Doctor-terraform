// TODO: axios 설정으로 변경
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const userApi = {
  // 사용자용 가이드라인 조회 (읽기 전용)
  getGuidelines: async (): Promise<string[]> => {
    // TODO: 실제 API 호출로 변경
    // const response = await fetch(`${API_BASE_URL}/guidelines`);
    // return response.json();
    
    const saved = localStorage.getItem('admin_guidelines');
    return saved ? JSON.parse(saved) : [];
  }
};