import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { getOnboardingData, saveOnboardingData, clearOnboardingData } from '../../utils/onboardingStorage';
import { userApi } from '../../api/user';
import { useAuth } from '../../context/AuthContext';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AppText } from '@/components/ui/AppText';
import { Ionicons } from '@expo/vector-icons';

const GOAL_OPTIONS = [
  { label: 'Weight Loss', value: 'weight_loss', desc: 'bicycle-outline' },
  { label: 'Weight Gain', value: 'weight_gain', desc: 'barbell-outline' },
];

export default function GoalScreen() {
  const router = useRouter();
  const { user, completeOnboarding } = useAuth();
  const [goal, setGoal] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      getOnboardingData(user.id).then(data => {
        if (data.goal) setGoal(data.goal);
        setIsLoading(false);
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!goal) {
      setError('Please select a goal');
      return;
    }
    setError('');

    if (!user) {
      setError('User not authenticated');
      return;
    }

    // Save locally first in case of network error
    const savedData = await saveOnboardingData(user.id, { goal });

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
      await clearOnboardingData(user.id);
      completeOnboarding();

    } catch (e: any) {
      setError(e.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/lifestyle');
    }
  };

  if (isLoading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.top}>
          <ProgressBar currentStep={6} totalSteps={6} />
        </View>
        <View style={styles.main}>
          <AppText fontFamily="Thernaly" style={styles.title}>What are you <Text style={styles.highlight}>working</Text> toward?</AppText>

          <View style={styles.optionsContainer}>
            {GOAL_OPTIONS.map((option) => {
              const isSelected = goal === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => {
                    setGoal(option.value);
                    setError('');
                  }}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {/* Icon */}
                  <View style={styles.optionIconContainer}>
                    <Ionicons name={option.desc as any} size={25}></Ionicons>
                  </View>

                  {/* Title and description */}
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>

                    <Text style={styles.optionDescription}>
                      {option.value === 'weightLoss'
                        ? 'Lose weight and improve body composition.'
                        : 'Build healthy mass and get stronger.'}
                    </Text>
                  </View>

                </TouchableOpacity>
              );
            })}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttonContainer}>
            <Button
              title="Back"
              onPress={handleBack}
              style={styles.buttonA}
              disabled={isSubmitting}
              textColor="#153131"
            />
            <Button
              title={isSubmitting ? "Saving..." : "Complete Setup"}
              onPress={handleSubmit}
              style={styles.buttonB}
              disabled={isSubmitting}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    marginTop: 50
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f0f6',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
  },
  main: {
    marginTop: 180
  },
  title: {
    fontSize: 40,
    fontWeight: '600',
    marginBottom: 24,
    color: '#000',
  },
  highlight: {
    color: "#9fc490"
  },
  optionsContainer: {
    gap: 16,
  },

  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 116,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    gap: 14,
  },

  optionButtonSelected: {
    borderColor: '#9FC490',
    backgroundColor: '#C0DFA1',
  },

  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 5,
    backgroundColor: 'rgba(21, 49, 49, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionIcon: {
    fontSize: 34,
    color: '#153131',
  },

  optionContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },

  optionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#153131',
  },

  optionTextSelected: {
    color: '#153131',
  },

  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#526361',
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
  buttonA: {
    width: "50%",
    backgroundColor: "#C0DFA1"
  },
  buttonB: {
    width: "50%",
    backgroundColor: "#153131"
  },
});
