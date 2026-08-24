import { apiClient } from "./client";

export const userApi = {
  getDetails: async () => {
    return await apiClient("/api/user/details");
  },
  postDetails: async (details: Record<string, any>) => {
    return await apiClient("/api/user/details", { data: details });
  }
};
