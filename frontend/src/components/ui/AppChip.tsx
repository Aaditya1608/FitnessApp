import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { BorderRadius } from '@/constants/theme';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';

export type AppChipVariant = 'default' | 'selected' | 'removable';

interface AppChipProps {
  label: string;
  variant?: AppChipVariant;
  onPress?: () => void;
  onRemove?: () => void;
  style?: ViewStyle;
}

export function AppChip({ label, variant = 'default', onPress, onRemove, style }: AppChipProps) {
  const { colors } = useAppTheme();

  const isSelected = variant === 'selected';
  const isRemovable = variant === 'removable';

  const backgroundColor = isSelected ? colors.primary : colors.backgroundElement;
  const textColor = isSelected ? '#000000' : colors.text;
  const borderColor = isSelected ? 'transparent' : colors.border;

  const Container = (onPress || isRemovable) ? TouchableOpacity : View;

  const handlePress = () => {
    if (isRemovable && onRemove) {
      onRemove();
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <Container
      style={[
        styles.chip,
        { backgroundColor, borderColor, borderWidth: isSelected ? 0 : 1 },
        style
      ]}
      onPress={(onPress || isRemovable) ? handlePress : undefined}
      activeOpacity={0.8}
    >
      <AppText variant="caption" color={textColor} style={styles.label}>
        {label}
      </AppText>
      {isRemovable && (
        <View style={styles.iconContainer}>
          <AppIcon name="close" size={16} color={textColor} />
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '500',
  },
  iconContainer: {
    marginLeft: 6,
  }
});
