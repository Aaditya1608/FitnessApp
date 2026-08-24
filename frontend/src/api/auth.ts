import { apiClient } from "./client";

export const authApi = {
  login: async (credentials: Record<string, string>) => {
    return await apiClient("/api/auth/login", { data: credentials });
  },

  signup: async (details: Record<string, string>) => {
    return await apiClient("/api/auth/signup", { data: details });
  },

  logout: async () => {
    return await apiClient("/api/auth/logout", { method: "POST" });
  },

  getMe: async () => {
    return await apiClient("/api/auth/me");
  },
};
