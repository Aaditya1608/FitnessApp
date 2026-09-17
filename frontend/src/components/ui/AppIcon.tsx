import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';

interface AppIconProps {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: string;
}

export function AppIcon({ name, size = 24, color }: AppIconProps) {
  const { colors } = useAppTheme();
  
  return (
    <Ionicons 
      name={name} 
      size={size} 
      color={color || colors.text} 
    />
  );
}
