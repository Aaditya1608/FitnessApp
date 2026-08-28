/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 *
 * useTheme returns just the colors object (same shape as before)
 * but sources it from ThemeContext so the user-persisted dark/light
 * preference is respected, rather than always using the OS setting.
 */

import { useAppTheme } from '@/context/ThemeContext';

export function useTheme() {
  return useAppTheme().colors;
}

