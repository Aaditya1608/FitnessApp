import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>FitJourney</Text>
          <Text style={styles.subtitle}>Your personal fitness and nutrition companion.</Text>
        </View>

        <View style={styles.actionContainer}>
          <Button
            title="Log In"
            onPress={() => router.push('/(auth)/login' as any)}
            style={styles.loginButton}
          />
          <Button
            title="Sign Up"
            variant="secondary"
            onPress={() => router.push('/(auth)/signup' as any)}
            style={styles.signUpButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#464b71',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    fontFamily: 'Outfit-Bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#A1A1AA',
    lineHeight: 24,
  },
  actionContainer: {
    gap: 8,
  },
  loginButton: {
    borderWidth: 2,
    borderColor: "#A1A1AA",
    borderRadius: 12,
  },
  signUpButton: {
    borderWidth: 2,
    borderColor: "#A1A1AA",
    borderRadius: 12,
    backgroundColor: 'black',
  }
});
