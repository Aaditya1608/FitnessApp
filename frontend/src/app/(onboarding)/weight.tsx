import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { getOnboardingData, saveOnboardingData } from '../../utils/onboardingStorage';

export default function WeightScreen() {
  const router = useRouter();
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOnboardingData().then(data => {
      if (data.weight) setWeight(data.weight);
      setIsLoading(false);
    });
  }, []);

  const handleNext = async () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0 || w > 500) {
      setError('Please enter a valid weight');
      return;
    }
    setError('');
    await saveOnboardingData({ weight });
    router.push('/height');
  };

  if (isLoading) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <TextInput
          label="What is your current weight (kg)?"
          placeholder="e.g. 70"
          keyboardType="numeric"
          value={weight}
          onChangeText={(text) => {
            setWeight(text);
            setError('');
          }}
          error={error}
        />
        <Button title="Continue" onPress={handleNext} style={styles.button} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  button: {
    marginTop: 24,
  }
});
