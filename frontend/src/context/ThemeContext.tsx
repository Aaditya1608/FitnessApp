import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ThemeColor } from '@/constants/theme';

const THEME_STORAGE_KEY = '@theme_preference';

type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  isDark: boolean;
  toggleTheme: () => void;
  colors: Record<ThemeColor, string>;
}


const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
          setColorScheme(stored);
        }
      } catch {
        // fallback to light
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setColorScheme(prev => {
      const next: ColorScheme = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value: ThemeContextType = {
    colorScheme,
    isDark: colorScheme === 'dark',
    toggleTheme,
    colors: Colors[colorScheme],
  };

  // Don't render children until preference is loaded to avoid flash
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}
