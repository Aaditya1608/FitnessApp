import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { ErrorText } from '@/components/ui/ErrorText';
import { Ionicons } from '@expo/vector-icons';
import {AppText} from '@/components/ui/AppText';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
      // Redirect to app happens automatically via AuthContext/RootLayout if user state updates
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.main}>
        <AppText fontFamily="Thernaly" style={styles.title}>Welcome Back</AppText>
        <AppText style={styles.subtitle}>Sign in to continue your fitness journey</AppText>
        </View>
      </View>

      <View style={styles.form}>
        <ErrorText error={error} />
        
        <TextInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />

        <TextInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <Button
          title="Log In"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.submitBtn}
          color="#153131"
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/signup' as any)}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f0f6',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 24,
  },
  main: {
    marginTop: 40
  },
  title: {
    fontSize: 44,
    color: '#000',
    marginTop: 10
  },
  subtitle: {
    marginTop: 8,
    fontSize: 20
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 25,
  },
  submitBtn: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#8E8E93',
  },
  footerLink: {
    color: '#153131',
    fontWeight: '600',
  },
});
