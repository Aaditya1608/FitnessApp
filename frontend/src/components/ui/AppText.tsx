import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";

interface AppTextProps extends TextProps {
  fontFamily?: "Thernaly" | "ThernalyItalic" | "System" | "PoppinsRegular" | "PoppinsBlack"| "PoppinsBold" | "PoppinsItalic";
}

export function AppText({
  fontFamily = "PoppinsRegular",
  style,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        styles.text,
        { fontFamily },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
});