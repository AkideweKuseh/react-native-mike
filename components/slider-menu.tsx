import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const dummyChats = [
  { id: "1", title: "Meeting Notes Summary", icon: "document-text-outline" },
  { id: "2", title: "Email Draft for Client", icon: "mail-outline" },
  { id: "3", title: "Travel Plan to Japan", icon: "airplane-outline" },
  { id: "4", title: "Project Idea Brainstorm", icon: "bulb-outline" },
  { id: "5", title: "Grocery List", icon: "list-outline" },
];

interface SliderMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onViewHistory: () => void;
}

export default function SliderMenu({
  isOpen,
  onClose,
  onNewChat,
  onViewHistory,
}: SliderMenuProps) {
  const slideAnim = useRef(new Animated.Value(-width * 0.75)).current; // Start off-screen to the left

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -width * 0.75,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen, slideAnim]);

  return (
    <Animated.View
      style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}
    >
      <LinearGradient
        colors={["#1A1A2E", "#16213E", "#0F3460"]}
        style={styles.background}
      />
      <View style={styles.header}>
        <Text style={styles.logoText}>Nexus</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-outline" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.menuItemsContainer}>
        <TouchableOpacity
          style={[styles.menuItem, styles.newChatMenuItem]}
          onPress={onNewChat}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#FFF" />
          <Text style={styles.menuItemText}>New Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={onViewHistory}>
          <Ionicons name="time-outline" size={22} color="#FFF" />
          <Text style={styles.menuItemText}>History</Text>
        </TouchableOpacity>

        <View style={styles.chatHistoryContainer}>
          {dummyChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatHistoryItem}
              onPress={() => console.log("Opening chat:", chat.title)}
            >
              <Ionicons name={chat.icon as any} size={18} color="#FFF" />
              <Text style={styles.chatHistoryItemText}>{chat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {/* You can add more menu items here */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.75, // 75% of screen width
    zIndex: 1000,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
  },
  closeButton: {
    padding: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  menuItemText: {
    color: "#FFF",
    fontSize: 18,
    marginLeft: 15,
    fontWeight: "500",
  },
  menuItemsContainer: {
    flex: 1,
  },
  newChatMenuItem: {
    marginBottom: 20,
  },
  chatHistoryContainer: {
    marginTop: 20,
  },
  chatHistoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  chatHistoryItemText: {
    color: "#FFF",
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "400",
  },
});
