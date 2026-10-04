import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform,TouchableOpacity,Text } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { getOnboardingData, saveOnboardingData } from '../../utils/onboardingStorage';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuth } from '../../context/AuthContext';

export default function WeightScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getOnboardingData(user.id).then(data => {
        if (data.weight) setWeight(data.weight);
        setIsLoading(false);
      });
    }
  }, [user]);

  const handleNext = async () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0 || w > 500) {
      setError('Please enter a valid weight');
      return;
    }
    setError('');
    if (user) {
      await saveOnboardingData(user.id, { weight });
    }
    router.push('/height');
  };

  if (isLoading) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      
      <View style={styles.content}>
        <View style={styles.top}>
          <ProgressBar currentStep={1} totalSteps={6} />
        </View>
        <View style={styles.main}>
          <AppText fontFamily="Thernaly" style={styles.title}>What is your Current <Text style={styles.weight}>Weight</Text>?</AppText>
        <TextInput
          label=""
          placeholder="Enter weight in kg:"
          keyboardType="numeric"
          value={weight}
          onChangeText={(text) => {
            setWeight(text);
            setError('');
          }}
          error={error}
        />
        <View style={styles.box}>
          <Ionicons name="sparkles-outline" size={20} color="#153131"/>
          <AppText fontFamily="PoppinsBold" style={styles.boxtext}>Your weight helps us estimate your calorie needs and track your progress over time</AppText>
        </View>
        <Button title="Continue" onPress={handleNext} style={styles.button} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  top:{
    marginTop: 50
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f0f6',
  },
  title: {
    fontSize: 40,
  },
  weight:{
    color: "#9fc490"
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
    gap: 50
  },
  button: {
    marginTop: 20,
    backgroundColor:"#153131"
  },
  box: {
    flexDirection:'row',
    backgroundColor:"#e9e6ec",
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 16,
    paddingRight: 16,
    marginLeft: 0,
    marginRight:0,
    borderRadius: 15,
    marginTop: 20
  },
  boxtext:{
    fontSize: 15,
    marginLeft: 10,
  },
  main:{
    marginTop: 220
  }
});
