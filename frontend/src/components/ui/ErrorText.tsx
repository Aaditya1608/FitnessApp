import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ErrorTextProps {
  error: string | null;
}

export function ErrorText({ error }: ErrorTextProps) {
  if (!error) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle" size={16} color="#FF3B30" />
      <Text style={styles.error}>{error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEB",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    width: "100%",
  },
  error: {
    color: "#FF3B30",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});
