import axios from "./axios";

export const userApi = {
  getProviders: async () => {
    const { data } = await axios.get("/api/providers");
    return data;
  },

  getServicesByProvider: async (providerId: number) => {
    const { data } = await axios.get(`/api/services/provider/${providerId}`);
    return data;
  },

  getGuidelines: async () => {
    const { data } = await axios.get("/api/guidelines");
    return data;
  },

  getGuidelinesByService: async (serviceId: number) => {
    const { data } = await axios.get(`/api/guidelines/service/${serviceId}`);
    return data;
  },

  getChecklists: async () => {
    const { data } = await axios.get("/api/checklists");
    return data;
  },

  getChecklistsByGuideline: async (guidelineId: number) => {
    const { data } = await axios.get(
      `/api/checklists/guideline/${guidelineId}`
    );
    return data;
  },

  getUserChecklists: async (userId: number) => {
    const { data } = await axios.get(`/api/user-checklists/${userId}`);
    return data;
  },
};
