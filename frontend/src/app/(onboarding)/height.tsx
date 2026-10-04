import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform,Text } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { getOnboardingData, saveOnboardingData } from '../../utils/onboardingStorage';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {AppText} from '@/components/ui/AppText';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function HeightScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [height, setHeight] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getOnboardingData(user.id).then(data => {
        if (data.height) setHeight(data.height);
        setIsLoading(false);
      });
    }
  }, [user]);

  const handleNext = async () => {
    const h = parseFloat(height);
    if (isNaN(h) || h <= 0 || h > 300) {
      setError('Please enter a valid height');
      return;
    }
    setError('');
    if (user) {
      await saveOnboardingData(user.id, { height });
    }
    router.push('/age' as any);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/weight');
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
                  <ProgressBar currentStep={2} totalSteps={6} />
        </View>
        <View style={styles.main}>
          <AppText fontFamily="Thernaly" style={styles.title}>How <Text style={styles.height}>Tall</Text> are you?</AppText>
          <AppText style={styles.subtitle}>Lorem, ipsum dolor sit amet consectetur adipisicing elit.</AppText>
        <TextInput
          label=""
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
          <Button title="Back" onPress={handleBack} style={styles.buttonA} textColor="#153131"/>
          <Button title="Continue" onPress={handleNext} style={styles.buttonB} />
        </View>
        <View style={styles.extraBox}>
          
          <Ionicons name="body-outline" size={20} color="#153131" style={styles.icon}/>
          <AppText fontFamily="PoppinsBold" style={styles.extraBoxText}>A more accurate height lets us give you better recommendations.</AppText>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
  },
  title:{
    fontSize: 40
  },
  subtitle:{
    fontSize: 16,
    marginTop: 8
  },
  height: {
    color:"#9fc490"
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    justifyContent:"space-between"
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
  extraBox: {
    marginTop: 40,
    backgroundColor: "#e9e6ec",
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row'
  },
  extraBoxText:{
    marginLeft: 10,
    fontSize: 15,
  },icon:{
    marginTop: 3
  }
});
