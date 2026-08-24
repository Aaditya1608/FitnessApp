import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { getOnboardingData, saveOnboardingData, clearOnboardingData } from '../../utils/onboardingStorage';
import { userApi } from '../../api/user';
import { useAuth } from '../../context/AuthContext';

const GOAL_OPTIONS = [
  { label: 'Weight Loss', value: 'weight_loss' },
  { label: 'Weight Gain', value: 'weight_gain' },
];

export default function GoalScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [goal, setGoal] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getOnboardingData().then(data => {
      if (data.goal) setGoal(data.goal);
      setIsLoading(false);
    });
  }, []);

  const handleSubmit = async () => {
    if (!goal) {
      setError('Please select a goal');
      return;
    }
    setError('');
    
    // Save locally first in case of network error
    const savedData = await saveOnboardingData({ goal });
    
    if (!savedData) {
       setError('Failed to retrieve full data. Please try again.');
       return;
    }

    setIsSubmitting(true);
    
    try {
      // Send single request to the backend
      await userApi.postDetails({
        weight: parseFloat(savedData.weight as string),
        height: parseFloat(savedData.height as string),
        age: parseInt(savedData.age as string, 10),
        sex: savedData.sex,
        lifestyle: savedData.lifestyle,
        goal: savedData.goal,
      });

      // Clear local storage and update context to allow entry to (app)
      await clearOnboardingData();
      completeOnboarding();
      
    } catch (e: any) {
      setError(e.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What is your primary goal?</Text>
        
        <View style={styles.optionsContainer}>
          {GOAL_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                goal === option.value && styles.optionButtonSelected
              ]}
              onPress={() => {
                setGoal(option.value);
                setError('');
              }}
              disabled={isSubmitting}
            >
              <Text style={[
                styles.optionText,
                goal === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.buttonContainer}>
          <Button 
            title="Back" 
            variant="secondary" 
            onPress={handleBack} 
            style={styles.button} 
            disabled={isSubmitting}
          />
          <Button 
            title={isSubmitting ? "Saving..." : "Complete Setup"} 
            onPress={handleSubmit} 
            style={styles.button} 
            disabled={isSubmitting}
          />
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
