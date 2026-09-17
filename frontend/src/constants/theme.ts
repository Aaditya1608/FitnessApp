/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#f5f0f6',
    backgroundElement: '#ffffff',
    backgroundSelected: '#E0E1E6',
    textSecondary: 'rgba(21, 49, 49, 0.7)',
    primary: '#c0dfa1',
    secondary: '#9fc490',
    surface: '#ffffff',
    border: 'rgba(21, 49, 49, 0.1)',
    error: '#E57373',
  },
  dark: {
    text: '#f5f0f6',
    background: '#000000',
    backgroundElement: '#153131',
    backgroundSelected: '#2E3135',
    textSecondary: '#9fc490',
    primary: '#c0dfa1',
    secondary: '#9fc490',
    surface: '#153131',
    border: 'rgba(245, 240, 246, 0.1)',
    error: '#EF5350',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  seven: 96,
  eight: 128,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
} as const;

export const Shadows = {
  light: {
    sm: {
      shadowColor: '#153131',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#153131',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  dark: {
    sm: { elevation: 0 },
    md: { elevation: 0 },
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
