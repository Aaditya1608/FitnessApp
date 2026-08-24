import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { getOnboardingData, saveOnboardingData } from '../../utils/onboardingStorage';

const SEX_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export default function SexScreen() {
  const router = useRouter();
  const [sex, setSex] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOnboardingData().then(data => {
      if (data.sex) setSex(data.sex);
      setIsLoading(false);
    });
  }, []);

  const handleNext = async () => {
    if (!sex) {
      setError('Please select an option');
      return;
    }
    setError('');
    await saveOnboardingData({ sex });
    router.push('/lifestyle' as any);
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What is your biological sex?</Text>
        
        <View style={styles.optionsContainer}>
          {SEX_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                sex === option.value && styles.optionButtonSelected
              ]}
              onPress={() => {
                setSex(option.value);
                setError('');
              }}
            >
              <Text style={[
                styles.optionText,
                sex === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.buttonContainer}>
          <Button title="Back" variant="secondary" onPress={handleBack} style={styles.button} />
          <Button title="Continue" onPress={handleNext} style={styles.button} />
        </View>
      </View>
    </View>
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
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: '#208AEF',
    backgroundColor: '#EBF4FF',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  optionTextSelected: {
    color: '#208AEF',
    fontWeight: '600',
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
