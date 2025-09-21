import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

export default function WelcomeMessage() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1A1A2E", "#16213E", "#0F3460"]}
        style={styles.background}
      />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="sparkles-outline" size={60} color="#FFF" />
        </View>
        <Text style={styles.title}>Welcome to Nexus!</Text>
        <Text style={styles.subtitle}>
          Your AI assistant is ready to help you with anything.
        </Text>
        <Text style={styles.prompt}>Start by typing a message below.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    alignItems: "center",
    maxWidth: width - 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#E5E5E7",
    textAlign: "center",
    marginBottom: 20,
  },
  prompt: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
});
