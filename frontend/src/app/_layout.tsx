import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider as AppThemeProvider, useAppTheme } from '../context/ThemeContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading: authLoading, hasDetails } = useAuth();
  const { colorScheme } = useAppTheme();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    'Thernaly-Regular': require('../../assets/fonts/thernally/Thernaly-Regular.ttf'),
    'Thernaly-Italic': require('../../assets/fonts/thernally/Thernaly-Italic.ttf'),
  });

  const isLoading = authLoading || (!fontsLoaded && !fontError);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!user && !inAuthGroup) {
      // Redirect to the welcome/login page
      router.replace('/(auth)/welcome');
    } else if (user) {
      if (!hasDetails && !inOnboardingGroup) {
        // User authenticated but no details
        router.replace('/(onboarding)' as any);
      } else if (hasDetails && (inAuthGroup || inOnboardingGroup)) {
        // User authenticated and has details
        router.replace('/(app)' as any);
      }
    }
  }, [user, isLoading, hasDetails, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  const CustomDefaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.light.background,
      card: Colors.light.surface,
    },
  };

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.background,
      card: Colors.dark.surface,
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomDefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </AppThemeProvider>
  );
}

