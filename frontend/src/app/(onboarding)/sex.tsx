import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { getOnboardingData, saveOnboardingData } from '../../utils/onboardingStorage';
import { useAuth } from '../../context/AuthContext';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AppText } from '@/components/ui/AppText';

const SEX_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export default function SexScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [sex, setSex] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getOnboardingData(user.id).then(data => {
        if (data.sex) setSex(data.sex);
        setIsLoading(false);
      });
    }
  }, [user]);

  const handleNext = async () => {
    if (!sex) {
      setError('Please select an option');
      return;
    }
    setError('');
    if (user) {
      await saveOnboardingData(user.id, { sex });
    }
    router.push('/lifestyle' as any);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/age');
    }
  };

  if (isLoading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.top}>
          <ProgressBar currentStep={4} totalSteps={6} />
        </View>
        <AppText fontFamily="Thernaly" style={styles.title}>What is your <Text style={styles.highlight}>biological</Text> sex?</AppText>

        <View style={styles.optionsContainer}>
          {SEX_OPTIONS.map((option) => {
            const isSelected = sex === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => {
                  setSex(option.value);
                  setError('');
                }}
                activeOpacity={0.8}
              >
                {/* Gender icon */}
                <Text
                  style={[
                    styles.optionIcon,
                    isSelected && styles.optionIconSelected,
                  ]}
                >
                  {option.value === 'male'
                    ? '♂'
                    : option.value === 'female'
                      ? '♀'
                      : '⚧'}
                </Text>

                {/* Label */}
                <AppText
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                  fontFamily="PoppinsBold"
                >
                  {option.label}
                </AppText>

                {/* Radio indicator */}
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
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
  title: {
    fontSize: 40,
    marginTop: 120,
    marginBottom: 24,
    color: '#000',
  },
  highlight: {
    color: "#9fc490"
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },

  optionButton: {
    flex: 1,
    height: 180,
    borderRadius: 24,
    backgroundColor: '#Fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',

    alignItems: 'center',
    justifyContent: 'center',

    paddingVertical: 18,
  },

  optionButtonSelected: {
    backgroundColor: '#C0DFA1',
    borderColor: '#C0DFA1',
  },

  optionIcon: {
    fontSize: 48,
    color: '#153131',
    marginBottom: 14,
  },

  optionIconSelected: {
    color: '#153131',
  },

  optionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#153131',
    marginBottom: 16,
  },

  optionTextSelected: {
    color: '#153131',
    fontWeight: '700',
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#A9A9A9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioOuterSelected: {
    borderColor: '#153131',
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#153131',
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
