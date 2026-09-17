import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';

export type AppTextVariant = 'display' | 'heading' | 'subheading' | 'body' | 'caption' | 'button';

export interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  color?: string; // Optional override
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function AppText({ 
  variant = 'body', 
  color, 
  align = 'left',
  style, 
  children, 
  ...props 
}: AppTextProps) {
  const { colors } = useAppTheme();

  // Thernaly variants
  const isThernaly = ['display', 'heading', 'subheading'].includes(variant);
  
  // Default color is primary text, unless caption which uses secondary
  const defaultColor = variant === 'caption' ? colors.textSecondary : colors.text;
  const finalColor = color || defaultColor;

  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        { 
          color: finalColor,
          textAlign: align,
          fontFamily: isThernaly ? 'Thernaly-Regular' : undefined,
        },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    // any base styles
  },
  display: {
    fontSize: 48,
    lineHeight: 56,
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
  },
  subheading: {
    fontSize: 20,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
});
