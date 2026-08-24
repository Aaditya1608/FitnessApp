import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { getOnboardingData } from '../../utils/onboardingStorage';

export default function OnboardingIndex() {
  const router = useRouter();

  useEffect(() => {
    const determineNextStep = async () => {
      const data = await getOnboardingData();

      if (!data.weight) {
        router.replace('/weight');
      } else if (!data.height) {
        router.replace('/height');
      } else if (!data.age) {
        router.replace('/age');
      } else if (!data.sex) {
        router.replace('/sex');
      } else if (!data.lifestyle) {
        router.replace('/lifestyle');
      } else if (!data.goal) {
        router.replace('/goal');
      } else {
        // Fallback, if somehow everything is there but not completed
        router.replace('/goal');
      }
    };

    determineNextStep();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#208AEF" />
    </View>
  );
}
