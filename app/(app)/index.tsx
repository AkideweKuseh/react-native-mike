import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  ColorValue,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SliderMenu from "../../components/slider-menu";

const { width } = Dimensions.get("window");

const quickActionCards: {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: readonly [ColorValue, ColorValue, ...ColorValue[]];
}[] = [
  {
    id: "summarize-emails",
    title: "Summarize Emails",
    description: "Get a quick overview of your inbox",
    icon: "mail-unread-outline",
    gradient: ["#4ECDC4", "#44A08D"],
  },
  {
    id: "upcoming-events",
    title: "Upcoming Events",
    description: "See what's next on your schedule",
    icon: "calendar-outline",
    gradient: ["#FF6B9D", "#C44DC4"],
  },
];

const historyItems = [
  {
    id: 1,
    title: "Calendar Agent",
    description: "Today's schedule",
    icon: "calendar-outline",
    color: "#FF6B9D",
  },
  {
    id: 2,
    title: "Email Agent",
    description: "Unread messages",
    icon: "mail-outline",
    color: "#4ECDC4",
  },
  {
    id: 3,
    title: "Sheets Agent",
    description: "Monthly expenses",
    icon: "grid-outline",
    color: "#F093FB",
  },
  {
    id: 4,
    title: "Drive Agent",
    description: "Recent documents",
    icon: "folder-outline",
    color: "#4FACFE",
  },
];

export default function HomeScreen() {
  const router: any = useRouter();
  const handleAgentPress = (agent: string) => {
    router.push("(app)/chat");
  };

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchBarWidth = useRef(new Animated.Value(width - 94)).current; // Initial width (screen width - parent horizontal padding - button width - button marginLeft)

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.timing(searchBarWidth, {
      toValue: width - 40, // Expanded width (screen width - parent horizontal padding)
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    Animated.timing(searchBarWidth, {
      toValue: width - 94, // Collapsed width
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNewChat = () => {
    setIsMenuOpen(false);
    router.push("(app)/chat");
  };

  const handleViewHistory = () => {
    setIsMenuOpen(false);
    // Navigate to history screen or display history
    console.log("View History");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1A1A2E", "#16213E", "#0F3460"]}
        style={styles.background}
      />

      {isMenuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      <SliderMenu
        isOpen={isMenuOpen}
        onClose={toggleMenu}
        onNewChat={handleNewChat}
        onViewHistory={handleViewHistory}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
            <LinearGradient
              colors={["#FF6B9D", "#C44DC4"]}
              style={styles.menuGradient}
            >
              <View style={styles.menuIcon}>
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.premiumButton}>
            <Text style={styles.premiumText}>Try premium</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>
              Welcome,
              {"\n"}ready to assist you.
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchAndNewChatContainer}>
            <Animated.View
              style={[styles.searchContainer, { width: searchBarWidth }]}
            >
              <Ionicons name="search-outline" size={20} color="#8E8E93" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#8E8E93"
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
            </Animated.View>
            {!isSearchFocused && (
              <TouchableOpacity
                style={styles.standaloneNewChatButton}
                onPress={() => router.push("(app)/chat")}
              >
                <Ionicons name="add-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Agent Cards */}
          <View style={styles.cardsGrid}>
            {quickActionCards.map((agent) => (
              <TouchableOpacity
                key={agent.id}
                style={styles.agentCard}
                onPress={() => handleAgentPress(agent.id)}
              >
                <LinearGradient
                  colors={agent.gradient}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={agent.icon as any} size={24} color="#FFF" />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{agent.title}</Text>
                    <Text style={styles.cardSubtitle}>{agent.description}</Text>
                  </View>
                  <Ionicons
                    name="arrow-up-outline"
                    size={16}
                    color="#FFF"
                    style={styles.cardArrow}
                  />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* History Section */}
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>History</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {historyItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.historyItem}
                onPress={() => router.push("(app)/chat")}
              >
                <View
                  style={[styles.historyIcon, { backgroundColor: item.color }]}
                >
                  <Ionicons name={item.icon as any} size={20} color="#FFF" />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyAgent}>{item.title}</Text>
                  <Text style={styles.historyQuery}>{item.description}</Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={16}
                  color="#8E8E93"
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  menuGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    gap: 3,
  },
  menuLine: {
    width: 18,
    height: 2,
    backgroundColor: "#FFF",
    borderRadius: 1,
  },
  premiumButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  premiumText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFF",
    lineHeight: 42,
  },
  searchAndNewChatContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 30,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    marginLeft: 12,
  },
  newChatButton: {
    marginLeft: 10,
  },
  standaloneNewChatButton: {
    marginLeft: 10, // Add some space between search bar and button
    backgroundColor: "#007BFF", // Example color, adjust as needed
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 40,
  },
  agentCard: {
    width: (width - 52) / 2,
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    position: "relative",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  cardSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginTop: 4,
  },
  cardArrow: {
    position: "absolute",
    top: 16,
    right: 16,
    transform: [{ rotate: "45deg" }],
  },
  historySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  historyTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "600",
  },
  seeAllText: {
    color: "#8E8E93",
    fontSize: 14,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyAgent: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  historyQuery: {
    color: "#8E8E93",
    fontSize: 14,
    marginTop: 2,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },
});
