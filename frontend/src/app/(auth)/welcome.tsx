import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import {AppText} from '@/components/ui/AppText';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText fontFamily="Thernaly" style={styles.title}>FitJourney</AppText>
          <AppText style={styles.subtitle}>Your personal fitness and nutrition companion.</AppText>
          
        </View>

        <View style={styles.actionContainer}>
          <Button
            title="Log In"
            onPress={() => router.push('/(auth)/login' as any)}
            style={styles.loginButton}
            textColor="#f5f0f6"
          />
          <Button
            title="Sign Up"
            // variant="secondary"
            onPress={() => router.push('/(auth)/signup' as any)}
            style={styles.signUpButton}
            textColor="#000000"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f0f6',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  header: {
    marginTop: 100,
  },
  title: {
    fontSize: 48,
    color: '#000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#153131',
    lineHeight: 24,
  },
  actionContainer: {
    gap: 8,
  },
  loginButton: {
    borderRadius: 24,
    backgroundColor: '#153131',
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
  },
  signUpButton: {
    borderRadius: 24,
    backgroundColor: '#c0dfa1',
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
  }
});
