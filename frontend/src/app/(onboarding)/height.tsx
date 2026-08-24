import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { getOnboardingData, saveOnboardingData } from '../../utils/onboardingStorage';

export default function HeightScreen() {
  const router = useRouter();
  const [height, setHeight] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOnboardingData().then(data => {
      if (data.height) setHeight(data.height);
      setIsLoading(false);
    });
  }, []);

  const handleNext = async () => {
    const h = parseFloat(height);
    if (isNaN(h) || h <= 0 || h > 300) {
      setError('Please enter a valid height');
      return;
    }
    setError('');
    await saveOnboardingData({ height });
    router.push('/age' as any);
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
          label="What is your height (cm)?"
          placeholder="e.g. 175"
          keyboardType="numeric"
          value={height}
          onChangeText={(text) => {
            setHeight(text);
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
