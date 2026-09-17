import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { BorderRadius, Shadows } from '@/constants/theme';

export type AppCardVariant = 'default' | 'outlined' | 'flat' | 'elevated';

interface AppCardProps extends ViewProps {
  variant?: AppCardVariant;
}

export function AppCard({ variant = 'default', style, children, ...props }: AppCardProps) {
  const { colors, colorScheme } = useAppTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'flat':
        return {
          backgroundColor: colors.backgroundElement,
        };
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          ...Shadows[colorScheme].md,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.surface,
          ...Shadows[colorScheme].sm,
        };
    }
  };

  return (
    <View style={[styles.card, getVariantStyles(), style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    padding: 16,
    width: '100%',
  }
});
