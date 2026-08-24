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
