import { apiClient } from "./client";

export const aiApi = {
  postCustomDish: async (payload: {
    title: string;
    ingredients: Record<string, string>;
    recipe: string[];
  }) => {
    return await apiClient("/api/ai/post-dish", {
      method: "POST",
      data: payload,
    });
  },
};
