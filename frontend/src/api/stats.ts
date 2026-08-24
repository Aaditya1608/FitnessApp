import { apiClient } from "./client";

export const statsApi = {
  getDaily: async (date?: string) => {
    const url = date ? `/api/stats/daily?date=${date}` : "/api/stats/daily";
    return await apiClient(url);
  },
  getMonthly: async (year: number, month: number) => {
    return await apiClient(`/api/stats/monthly?year=${year}&month=${month}`);
  }
};
