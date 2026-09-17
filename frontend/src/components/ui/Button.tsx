import React from "react";
import { TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { AppText } from "./AppText";
import { useAppTheme } from "@/context/ThemeContext";
import { BorderRadius } from "@/constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  color?: string; // Kept for compatibility, overrides background color
}

export function Button({ title, onPress, variant = "primary", loading, disabled, style, color }: ButtonProps) {
  const { colors } = useAppTheme();

  const getBackgroundColor = () => {
    if (color) return color;
    if (variant === "primary") return colors.primary;
    if (variant === "secondary") return colors.secondary;
    return "transparent";
  };

  const getTextColor = () => {
    if (variant === "primary") return "#000000"; // High contrast on Mint
    if (variant === "secondary") return "#000000"; // High contrast on Sage
    return colors.text;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === "ghost" && { borderWidth: 1, borderColor: colors.border },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <AppText variant="button" color={getTextColor()}>
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
});
