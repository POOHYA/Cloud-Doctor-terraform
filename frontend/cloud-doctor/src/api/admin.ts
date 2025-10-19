import axios from "./axios";
import { Service, GuidelineDetail } from "../types/guideline";

interface LoginResponse {
  message: string;
  username: string;
  role: string;
}

export const adminApi = {
  login: async (username: string, password: string): Promise<boolean> => {
    try {
      const { data } = await axios.post<LoginResponse>("/api/auth/login", {
        username,
        password,
      });
      sessionStorage.setItem("username", data.username);
      sessionStorage.setItem("role", data.role);

      // 사용자 정보 가져와서 fullName 저장
      const userInfo = await axios.get("/api/user/me");
      sessionStorage.setItem("fullName", userInfo.data.fullName);

      return true;
    } catch (error: any) {
      console.error("로그인 실패:", error.response?.data || error.message);
      return false;
    }
  },

  checkUsername: async (username: string): Promise<boolean> => {
    try {
      const { data } = await axios.get(
        `/api/auth/check-username?username=${username}`
      );
      return data.exists;
    } catch (error: any) {
      console.error(
        "아이디 중복확인 실패:",
        error.response?.data || error.message
      );
      return false;
    }
  },

  checkEmail: async (email: string): Promise<boolean> => {
    try {
      const { data } = await axios.get(`/api/auth/check-email?email=${email}`);
      return data.exists;
    } catch (error: any) {
      console.error(
        "이메일 중복확인 실패:",
        error.response?.data || error.message
      );
      return false;
    }
  },

  register: async (
    username: string,
    email: string,
    password: string,
    fullName: string,
    company?: string
  ): Promise<boolean> => {
    try {
      await axios.post("/api/auth/register", {
        username,
        email,
        password,
        fullName,
        company,
      });
      return true;
    } catch (error: any) {
      console.error("회원가입 실패:", error.response?.data || error.message);
      return false;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axios.post("/api/auth/logout");
    } finally {
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("fullName");
    }
  },

  getServices: async (): Promise<Service[]> => {
    const { data } = await axios.get("/admin/services");
    return data;
  },

  saveService: async (service: Omit<Service, "id">): Promise<void> => {
    await axios.post("/admin/services", service);
  },

  createService: async (serviceData: {
    cloudProviderId: number;
    name: string;
    displayName: string;
    isActive: boolean;
  }): Promise<void> => {
    await axios.post("/admin/services", serviceData);
  },

  updateService: async (
    id: string,
    service: Partial<Service>
  ): Promise<void> => {
    await axios.put(`/admin/services/${id}`, service);
  },

  deleteService: async (serviceId: string | number): Promise<void> => {
    await axios.delete(`/admin/services/${serviceId}`);
  },

  getGuidelines: async (): Promise<GuidelineDetail[]> => {
    const { data } = await axios.get("/api/guidelines");
    return data;
  },

  saveGuideline: async (
    guideline: Omit<GuidelineDetail, "id">
  ): Promise<void> => {
    await axios.post("/admin/guidelines", guideline);
  },

  deleteGuideline: async (guidelineId: string): Promise<void> => {
    await axios.delete(`/admin/guidelines/${guidelineId}`);
  },

  getUsers: async (): Promise<any[]> => {
    const { data } = await axios.get("/admin/users");
    return data;
  },

  getUserInfo: async (): Promise<any> => {
    const { data } = await axios.get("/api/user/me");
    return data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await axios.post("/api/user/change-password", {
      currentPassword,
      newPassword,
    });
  },

  saveChecklist: async (
    resultName: string,
    answers: Record<string, boolean>
  ): Promise<void> => {
    await axios.post("/api/user/checklist", { resultName, answers });
  },

  getMyChecklists: async (): Promise<any[]> => {
    const { data } = await axios.get("/api/user/checklists");
    return data;
  },

  getChecklistDetail: async (id: number): Promise<any> => {
    const { data } = await axios.get(`/api/user/checklist/${id}`);
    return data;
  },

  updateChecklist: async (
    id: number,
    resultName: string,
    answers: Record<string, boolean>
  ): Promise<void> => {
    await axios.put(`/api/user/checklist/${id}`, { resultName, answers });
  },

  getProviders: async (): Promise<any[]> => {
    const { data } = await axios.get("/api/providers");
    return data;
  },

  getServicesByProvider: async (providerId: number): Promise<any[]> => {
    const { data } = await axios.get(`/api/services/provider/${providerId}`);
    return data;
  },

  getGuidelinesByService: async (serviceId: number): Promise<any[]> => {
    const { data } = await axios.get(`/api/guidelines/service/${serviceId}`);
    return data;
  },

  getChecklistsByGuideline: async (guidelineId: number): Promise<any[]> => {
    const { data } = await axios.get(
      `/api/checklists/guideline/${guidelineId}`
    );
    return data;
  },

  getAdminChecklists: async (): Promise<any[]> => {
    const { data } = await axios.get("/admin/checklists");
    return data;
  },

  createChecklist: async (checklistData: any): Promise<void> => {
    await axios.post("/admin/checklists", checklistData);
  },

  deleteAdminChecklist: async (id: string | number): Promise<void> => {
    await axios.delete(`/admin/checklists/${id}`);
  },

  createGuideline: async (guidelineData: {
    title: string;
    cloudProviderId: number;
    serviceListId: number;
    importanceLevel: string;
    whyDangerous: string;
    whatHappens: string;
    checkStandard: string;
    solutionText?: string;
    sideEffects?: string;
    note?: string;
    links?: string[];
  }): Promise<void> => {
    await axios.post("/admin/guidelines", guidelineData);
  },

  getGuideline: async (id: number): Promise<any> => {
    const { data } = await axios.get(`/admin/guidelines/${id}`);
    return data;
  },

  getChecklist: async (id: number): Promise<any> => {
    const { data } = await axios.get(`/admin/checklists/${id}`);
    return data;
  },

  updateChecklist: async (
    id: number,
    checklistData: {
      title: string;
      isActive: boolean;
    }
  ): Promise<void> => {
    await axios.put(`/admin/checklists/${id}`, checklistData);
  },

  updateGuideline: async (
    id: number,
    guidelineData: {
      title: string;
      cloudProviderId: number;
      serviceListId: number;
      importanceLevel: string;
      whyDangerous: string;
      whatHappens: string;
      checkStandard: string;
      solutionText?: string;
      sideEffects?: string;
      note?: string;
      links?: string[];
    }
  ): Promise<void> => {
    await axios.put(`/admin/guidelines/${id}`, guidelineData);
  },
};
