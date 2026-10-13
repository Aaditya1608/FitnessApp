import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { getOnboardingData, saveOnboardingData } from '../../utils/onboardingStorage';
import { useAuth } from '../../context/AuthContext';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AppText } from '@/components/ui/AppText';
import { Ionicons } from '@expo/vector-icons';

const LIFESTYLE_OPTIONS = [
  { label: 'Sedentary', value: 'sedentary', desc: "body-outline" },
  { label: 'Lightly Active', value: 'lightly_active', desc: "headset-outline" },
  { label: 'Moderately Active', value: 'moderately_active', desc: "walk-outline" },
  { label: 'Highly Active', value: 'highly_active', desc: "basketball-outline" },
  { label: 'Extra Active', value: 'extra_active', desc: "bicycle-outline" },
];

export default function LifestyleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [lifestyle, setLifestyle] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getOnboardingData(user.id).then(data => {
        if (data.lifestyle) setLifestyle(data.lifestyle);
        setIsLoading(false);
      });
    }
  }, [user]);

  const handleNext = async () => {
    if (!lifestyle) {
      setError('Please select an option');
      return;
    }
    setError('');
    if (user) {
      await saveOnboardingData(user.id, { lifestyle });
    }
    router.push('/goal' as any);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/sex');
    }
  };

  if (isLoading) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <ProgressBar currentStep={5} totalSteps={6} />
        </View>
        <View style={styles.main}>
          <AppText fontFamily="Thernaly" style={styles.title}>What is your <Text style={styles.highlight}>lifestyle </Text>level?</AppText>

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
                <View style={styles.logoBox}>
                  <Ionicons name={option.desc as any} size={25}></Ionicons>
                </View>
                <AppText fontFamily="PoppinsBold" style={[
                  styles.optionText,
                  lifestyle === option.value && styles.optionTextSelected
                ]}>
                  {option.label}
                </AppText>

              </TouchableOpacity>
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttonContainer}>
            <Button title="Back" onPress={handleBack} style={styles.buttonA} textColor="#153131" />
            <Button title="Continue" onPress={handleNext} style={styles.buttonB} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    marginTop: 50
  },
  main: {
    marginTop: 160
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f0f6',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'flex-start',
  },
  logoBox: {
    backgroundColor: "#e9e6ec",
    padding: 5,
    borderRadius: 10
  },
  highlight: {
    color: "#9fc490"
  },
  title: {
    fontSize: 40,
    marginBottom: 24,
    color: '#000',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center"
  },
  optionButtonSelected: {
    borderColor: '#153131',
    backgroundColor: '#C0DFA1',
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
    color: '#153131',
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
