import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  color?: string;
}

export function Button({ title, onPress, variant = "primary", loading, disabled, style, color }: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        (disabled || loading) && styles.disabled,
        style,
        color? {backgroundColor: color }: null,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : "#208AEF"} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
    width: "100%",
  },
  primary: {
    backgroundColor: "#000000",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#208AEF",
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  textPrimary: {
    color: "#fff",
  },
  textSecondary: {
    color: "#208AEF",
  },
});
