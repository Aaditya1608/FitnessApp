import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingData {
  weight?: string;
  height?: string;
  age?: string;
  sex?: string;
  lifestyle?: string;
  goal?: string;
}

const getOnboardingKey = (userId: string) => `@onboarding_data_${userId}`;

export const getOnboardingData = async (userId: string): Promise<OnboardingData> => {
  try {
    const jsonValue = await AsyncStorage.getItem(getOnboardingKey(userId));
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error("Failed to fetch onboarding data", e);
    return {};
  }
};

export const saveOnboardingData = async (userId: string, data: Partial<OnboardingData>) => {
  try {
    const currentData = await getOnboardingData(userId);
    const newData = { ...currentData, ...data };
    await AsyncStorage.setItem(getOnboardingKey(userId), JSON.stringify(newData));
    return newData;
  } catch (e) {
    console.error("Failed to save onboarding data", e);
  }
};

export const clearOnboardingData = async (userId: string) => {
  try {
    await AsyncStorage.removeItem(getOnboardingKey(userId));
  } catch (e) {
    console.error("Failed to clear onboarding data", e);
  }
};
