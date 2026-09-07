import { apiClient } from './client';

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Ingredient {
  name: string;
  amount: string;
}

export interface Dish {
  title: string;
  serving_size: string;
  recipe: string[];
  ingredients: Ingredient[];
  macros: Macros;
  prep_time: number;
  isSaved?: boolean;
}

export const generateDishes = async (ingredients: string[]): Promise<{ success: boolean; data: Dish[], message?: string }> => {
  return apiClient('/api/ai/generate', {
    data: { ingredients },
  });
};

export const saveDish = async (dish: Dish) => {
  return apiClient('/api/dishes/saved', {
    data: dish,
  });
};

export const logDish = async (dish: Dish) => {
  return apiClient('/api/dishes/log', {
    data: dish,
  });
};

export interface GetSavedDishesFilters {
  ingredient?: string;
  maxPrepTime?: number;
  minProtein?: number;
  maxCalories?: number;
}

export const getSavedDishes = async (filters?: GetSavedDishesFilters): Promise<{ count: number; savedDishes: Dish[] }> => {
  const queryParams = new URLSearchParams();

  if (filters) {
    if (filters.ingredient) queryParams.append('ingredient', filters.ingredient);
    if (filters.maxPrepTime !== undefined && !isNaN(filters.maxPrepTime)) queryParams.append('maxPrepTime', filters.maxPrepTime.toString());
    if (filters.minProtein !== undefined && !isNaN(filters.minProtein)) queryParams.append('minProtein', filters.minProtein.toString());
    if (filters.maxCalories !== undefined && !isNaN(filters.maxCalories)) queryParams.append('maxCalories', filters.maxCalories.toString());
  }

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/dishes/saved?${queryString}` : '/api/dishes/saved';

  return apiClient(endpoint);
};

export const getDishHistory = async (): Promise<{ data: Dish[], message?: string }> => {
  return apiClient('/api/dishes/history');
};

export const getCustomDishes = async (): Promise<{ data: Dish[], message?: string }> => {
  return apiClient('/api/dishes/custom');
};
