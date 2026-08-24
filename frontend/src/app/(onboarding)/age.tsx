import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { getOnboardingData, saveOnboardingData } from '../../utils/onboardingStorage';

export default function AgeScreen() {
  const router = useRouter();
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOnboardingData().then(data => {
      if (data.age) setAge(data.age);
      setIsLoading(false);
    });
  }, []);

  const handleNext = async () => {
    const a = parseInt(age, 10);
    if (isNaN(a) || a <= 0 || a > 150) {
      setError('Please enter a valid age');
      return;
    }
    setError('');
    await saveOnboardingData({ age });
    router.push('/sex' as any);
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <TextInput
          label="What is your age?"
          placeholder="e.g. 25"
          keyboardType="numeric"
          value={age}
          onChangeText={(text) => {
            setAge(text);
            setError('');
          }}
          error={error}
        />
        <View style={styles.buttonContainer}>
          <Button title="Back" variant="secondary" onPress={handleBack} style={styles.button} />
          <Button title="Continue" onPress={handleNext} style={styles.button} />
        </View>
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  }
});
