import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingData {
  weight?: string;
  height?: string;
  age?: string;
  sex?: string;
  lifestyle?: string;
  goal?: string;
}

const ONBOARDING_KEY = '@onboarding_data';

export const getOnboardingData = async (): Promise<OnboardingData> => {
  try {
    const jsonValue = await AsyncStorage.getItem(ONBOARDING_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error("Failed to fetch onboarding data", e);
    return {};
  }
};

export const saveOnboardingData = async (data: Partial<OnboardingData>) => {
  try {
    const currentData = await getOnboardingData();
    const newData = { ...currentData, ...data };
    await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(newData));
    return newData;
  } catch (e) {
    console.error("Failed to save onboarding data", e);
  }
};

export const clearOnboardingData = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (e) {
    console.error("Failed to clear onboarding data", e);
  }
};
