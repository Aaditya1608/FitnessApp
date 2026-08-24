import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { getOnboardingData, saveOnboardingData } from '../../utils/onboardingStorage';

const LIFESTYLE_OPTIONS = [
  { label: 'Sedentary', value: 'sedentary', desc: 'Little or no exercise' },
  { label: 'Lightly Active', value: 'lightly_active', desc: 'Light exercise/sports 1-3 days/week' },
  { label: 'Moderately Active', value: 'moderately_active', desc: 'Moderate exercise/sports 3-5 days/week' },
  { label: 'Highly Active', value: 'highly_active', desc: 'Hard exercise/sports 6-7 days a week' },
  { label: 'Extra Active', value: 'extra_active', desc: 'Very hard exercise/sports & physical job' },
];

export default function LifestyleScreen() {
  const router = useRouter();
  const [lifestyle, setLifestyle] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOnboardingData().then(data => {
      if (data.lifestyle) setLifestyle(data.lifestyle);
      setIsLoading(false);
    });
  }, []);

  const handleNext = async () => {
    if (!lifestyle) {
      setError('Please select an option');
      return;
    }
    setError('');
    await saveOnboardingData({ lifestyle });
    router.push('/goal' as any);
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What is your lifestyle level?</Text>
        
        <View style={styles.optionsContainer}>
          {LIFESTYLE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                lifestyle === option.value && styles.optionButtonSelected
              ]}
              onPress={() => {
                setLifestyle(option.value);
                setError('');
              }}
            >
              <Text style={[
                styles.optionText,
                lifestyle === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.descText,
                lifestyle === option.value && styles.optionTextSelected
              ]}>
                {option.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.buttonContainer}>
          <Button title="Back" variant="secondary" onPress={handleBack} style={styles.button} />
          <Button title="Continue" onPress={handleNext} style={styles.button} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    color: '#000',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
  },
  optionButtonSelected: {
    borderColor: '#208AEF',
    backgroundColor: '#EBF4FF',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  descText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextSelected: {
    color: '#208AEF',
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
  }
});
