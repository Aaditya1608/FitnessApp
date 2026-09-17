import React, { useState } from "react";
import { View, TextInput as RNTextInput, StyleSheet, TouchableOpacity, TextInputProps as RNTextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { useAppTheme } from "@/context/ThemeContext";
import { BorderRadius } from "@/constants/theme";

interface TextInputProps extends RNTextInputProps {
  label: string;
  error?: string;
}

export function TextInput({ label, error, secureTextEntry, ...props }: TextInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <AppText variant="caption" color={colors.text} style={styles.label}>
        {label}
      </AppText>
      <View 
        style={[
          styles.inputContainer, 
          { 
            backgroundColor: colors.backgroundElement,
            borderColor: error ? colors.error : (isFocused ? colors.primary : colors.border)
          }
        ]}
      >
        <RNTextInput
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <AppText variant="caption" color={colors.error} style={styles.errorText}>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    marginBottom: 6,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    minHeight: 48,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
});
