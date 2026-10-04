import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform,Text } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { getOnboardingData, saveOnboardingData } from '../../utils/onboardingStorage';
import { useAuth } from '../../context/AuthContext';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AppText } from '@/components/ui/AppText';
import { Ionicons } from '@expo/vector-icons';

export default function AgeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getOnboardingData(user.id).then(data => {
        if (data.age) setAge(data.age);
        setIsLoading(false);
      });
    }
  }, [user]);

  const handleNext = async () => {
    const a = parseInt(age, 10);
    if (isNaN(a) || a <= 0 || a > 150) {
      setError('Please enter a valid age');
      return;
    }
    setError('');
    if (user) {
      await saveOnboardingData(user.id, { age });
    }
    router.push('/sex' as any);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/height');
    }
  };

  if (isLoading) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.top}>
                  <ProgressBar currentStep={3} totalSteps={6} />
                </View>
                <View style={styles.main}>
                  <AppText fontFamily="Thernaly" style={styles.title}>How old are <Text style={styles.age}>you</Text>?</AppText>
                  <AppText style={styles.subtitle}>No actually, how old are you?</AppText>
        <TextInput
          label=""
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
          <Button title="Back" onPress={handleBack} style={styles.buttonA} textColor="#153131"/>
          <Button title="Continue" onPress={handleNext} style={styles.buttonB} />
        </View>
        <View style={styles.extraBox}>
          
          <Ionicons name="information-circle-outline" size={20} color="#153131" style={styles.icon}/>
          <AppText fontFamily="PoppinsBold" style={styles.extraBoxText}>Age is no barrier and it's a limitation you put on your mind.</AppText>
        </View>
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
  title:{
    fontSize: 40
  },
  subtitle:{
    fontSize: 16,
    marginTop: 10
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  buttonA:{
    width: "50%",
    backgroundColor: "#C0DFA1"
  },
  buttonB:{
    width: "50%",
    backgroundColor: "#153131"
  },
  main:{
    marginTop: 220
  },
  age:{
    color: "#9fc490"
  },
  extraBox: {
    marginTop: 40,
    backgroundColor: "#e9e6ec",
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row'
  },
  extraBoxText:{
    marginLeft: 8,
    fontSize: 14,
  },
  icon:{
    marginTop: 3
  }
});
