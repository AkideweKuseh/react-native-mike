import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AudioMessage from "../../components/audio-message";
import WelcomeMessage from "../../components/welcome-message";
import { n8nService } from "../../services/n8n-services/n8nService";

interface Message {
  id: number;
  type: "user" | "assistant" | "audio";
  text?: string;
  timestamp: Date;
  audioUri?: string;
  duration?: number;
}

const sampleMessages: Message[] = [
  // {
  //   id: 1,
  //   type: "user",
  //   text: "Describe to me the basic principles of healthy eating. Briefly, but with all the important aspects, please, also you can tell me a little more about the topic of sports and training.",
  //   timestamp: new Date(),
  // },
  // {
  //   id: 2,
  //   type: "assistant",
  //   text: "Basic principles of a healthy diet:\n\nBalance: Make sure your diet contains all the essential macro and micronutrients in the correct proportions: carbohydrates, proteins, fats, vitamins and minerals. It is important to maintain a balance of calories to meet your body's needs, but not to overeat.",
  //   timestamp: new Date(),
  // },
  // {
  //   id: 3,
  //   type: "user",
  //   text: "Tell me more about it, please",
  //   timestamp: new Date(),
  // },
];

const CHAT_STORAGE_KEY = "chatMessages";

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const router: any = useRouter();
  // const { audioUri, duration } = useLocalSearchParams();

  // console.log("ChatScreen rendered - audioUri:", audioUri, "duration:", duration);

  // Effect to log changes in local search params
  // useEffect(() => {
  //   console.log("useLocalSearchParams changed:", { audioUri, duration });
  // }, [audioUri, duration]);

  // Effect to save messages to AsyncStorage
  useEffect(() => {
    const saveMessages = async () => {
      try {
        const jsonValue = JSON.stringify(messages);
        await AsyncStorage.setItem(CHAT_STORAGE_KEY, jsonValue);
        console.log("Messages saved to AsyncStorage.");
      } catch (e) {
        console.error("Error saving messages to AsyncStorage:", e);
      }
    };

    saveMessages();
  }, [messages]);

  // Effect to load messages from AsyncStorage on component mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
        if (jsonValue != null) {
          const storedMessages: Message[] = JSON.parse(jsonValue);
          // Convert timestamp strings back to Date objects
          const messagesWithDates = storedMessages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(messagesWithDates);
          if (messagesWithDates.length > 0) {
            setHasUserSentMessage(true);
          }
        } else {
          setMessages([]);
        }
        console.log("Messages loaded from AsyncStorage.");
      } catch (e) {
        console.error("Error loading messages from AsyncStorage:", e);
        setMessages([]); // Fallback to empty array on error
      }
    };

    loadMessages();
  }, []); // Empty dependency array means this effect runs once on mount

  useFocusEffect(
    React.useCallback(() => {
      const processAudioMessage = async () => {
        try {
          const storedAudioMessage = await AsyncStorage.getItem(
            "tempAudioMessage"
          );
          if (storedAudioMessage) {
            await AsyncStorage.removeItem("tempAudioMessage"); // Clear the stored data
            const { audioUri, duration } = JSON.parse(storedAudioMessage);

            console.log(
              "Received audioUri from AsyncStorage:",
              audioUri,
              "duration:",
              duration
            );

            const newAudioMessage: Message = {
              id: messages.length + 1,
              type: "audio",
              audioUri: audioUri as string,
              duration: parseFloat(duration as string),
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, newAudioMessage]);
            setHasUserSentMessage(true);
            setIsLoading(true);

            // Send audio to N8N service
            const audioFileName = audioUri.split("/").pop();
            const audioFileExtension = audioFileName?.split(".").pop();

            const audioFile = {
              uri: audioUri,
              name: audioFileName || "audio.m4a",
              type: `audio/${audioFileExtension || "m4a"}`, // Adjust MIME type as needed
            } as any; // Cast to any to bypass type checking for File object construction

            const n8nResponse = await n8nService.sendAudio(audioFile);
            console.log("n8n Audio Response:", n8nResponse);

            const assistantResponse: Message = {
              id: messages.length + 2,
              type: "assistant",
              text:
                n8nResponse.output ||
                n8nResponse.message || // Use n8nResponse.message if output is not available
                "Agent is processing your audio...", // More descriptive fallback
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantResponse]);
          }
        } catch (error) {
          console.error("Error processing audio from AsyncStorage:", error);
          const errorMessage: Message = {
            id: messages.length + 2,
            type: "assistant",
            text: "Oops! Something went wrong with the audio. Please try again.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      };

      processAudioMessage();
    }, [messages.length])
  );

  // useEffect(() => {
  //   if (audioUri && duration) {
  //     console.log(
  //       "Received audioUri in chat.tsx:",
  //       audioUri,
  //       "duration:",
  //       duration
  //     );

  //     const newAudioMessage: Message = {
  //       id: messages.length + 1,
  //       type: "audio",
  //       audioUri: audioUri as string,
  //       duration: parseFloat(duration as string),
  //       timestamp: new Date(),
  //     };
  //     setMessages((prev) => [...prev, newAudioMessage]);
  //     setHasUserSentMessage(true);
  //     setIsLoading(true);

  //     // Send audio to N8N service
  //     (async () => {
  //       try {
  //         // Create a File object from the local audio URI
  //         const audioUriValue = Array.isArray(audioUri)
  //           ? audioUri[0]
  //           : audioUri;
  //         const audioUriString = audioUriValue as string;
  //         const audioFileName = audioUriString.split("/").pop();
  //         const audioFileExtension = audioFileName?.split(".").pop();

  //         const audioFile = {
  //           uri: audioUriString,
  //           name: audioFileName || "audio.m4a",
  //           type: `audio/${audioFileExtension || "m4a"}`, // Adjust MIME type as needed
  //         } as any; // Cast to any to bypass type checking for File object construction

  //         const n8nResponse = await n8nService.sendAudio(audioFile);
  //         console.log("n8n Audio Response:", n8nResponse);

  //         const assistantResponse: Message = {
  //           id: messages.length + 2,
  //           type: "assistant",
  //           text:
  //             n8nResponse.output ||
  //             n8nResponse.message || // Use n8nResponse.message if output is not available
  //             "Agent is processing your audio...", // More descriptive fallback
  //           timestamp: new Date(),
  //         };
  //         setMessages((prev) => [...prev, assistantResponse]);
  //       } catch (error) {
  //         console.error("Error sending audio to n8n:", error);
  //         const errorMessage: Message = {
  //           id: messages.length + 2,
  //           type: "assistant",
  //           text: "Oops! Something went wrong with the audio. Please try again.",
  //           timestamp: new Date(),
  //         };
  //         setMessages((prev) => [...prev, errorMessage]);
  //       } finally {
  //         setIsLoading(false);
  //         router.setParams({ audioUri: undefined, duration: undefined });
  //       }
  //     })();
  //   }
  // }, [audioUri, duration, messages.length]);

  // useEffect(() => {
  //   // Clear audioUri and duration from params after processing
  //   if (audioUri || duration) {
  //     router.setParams({ audioUri: undefined, duration: undefined });
  //   }
  // }, [audioUri, duration]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const handleSend = async () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        type: "user",
        text: inputText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputText("");
      setIsLoading(true);
      if (!hasUserSentMessage) {
        setHasUserSentMessage(true);
      }

      try {
        const n8nResponse = await n8nService.sendMessage(inputText);
        console.log("n8n Response:", n8nResponse); // Added for debugging
        const assistantResponse: Message = {
          id: messages.length + 2,
          type: "assistant",
          text:
            n8nResponse.output ||
            "The agent did not return a response. Please try again.", // More descriptive fallback
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantResponse]);
      } catch (error) {
        console.error("Error sending message to n8n:", error);
        const errorMessage: Message = {
          id: messages.length + 2,
          type: "assistant",
          text: "Oops! Something went wrong. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVoicePress = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      router.push("/(app)/voice");
    }
  };

  const renderMessage = (message: Message) => {
    if (message.type === "audio") {
      return (
        <View
          key={message.id}
          style={[
            styles.messageContainer,
            styles.userMessage,
            { alignItems: "flex-end" }, // Force align right for user audio message
          ]}
        >
          <AudioMessage
            uri={message.audioUri!}
            duration={message.duration!}
            isUserMessage={true}
          />
        </View>
      );
    }

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          message.type === "user"
            ? styles.userMessage
            : styles.assistantMessage,
        ]}
      >
        {message.type === "assistant" && (
          <View style={styles.avatarContainer}>
            <Ionicons name="sparkles-outline" size={20} color="#FFF" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            message.type === "user"
              ? styles.userBubble
              : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: message.type === "user" ? "#FFF" : "#E5E5E7" },
            ]}
          >
            {message.text}
          </Text>
        </View>
        {message.type === "user" && (
          <View style={[styles.avatarContainer, styles.userAvatarContainer]}>
            <Text style={styles.userAvatarText}>You</Text>
          </View>
        )}

        {message.type === "assistant" && (
          <View style={styles.messageActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons
                name="volume-medium-outline"
                size={16}
                color="#8E8E93"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="copy-outline" size={16} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="refresh-outline" size={16} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.assistantMessage]}>
      <View style={styles.loadingBubble}>
        <View style={styles.typingIndicator}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1A1A2E", "#16213E", "#0F3460"]}
        style={styles.background}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <LinearGradient
                colors={["#FF6B9D", "#C44DC4"]}
                style={styles.iconGradient}
              >
                <View style={styles.diamondIcon} />
              </LinearGradient>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Daily Health Summary</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {hasUserSentMessage ? (
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }
            >
              {messages.map(renderMessage)}
              {isLoading && renderTypingIndicator()}
            </ScrollView>
          ) : (
            <WelcomeMessage />
          )}

          {/* Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Send message..."
                placeholderTextColor="#8E8E93"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />

              <TouchableOpacity
                style={styles.voiceButton}
                onPress={handleVoicePress}
              >
                <Animated.View
                  style={[
                    styles.voiceButtonInner,
                    {
                      transform: [{ scale: pulseAnim }],
                      backgroundColor: isRecording ? "#FF3B30" : "#FF6B9D",
                    },
                  ]}
                >
                  <Ionicons name="mic-outline" size={20} color="#FFF" />
                </Animated.View>
              </TouchableOpacity>

              {inputText.length > 0 && (
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSend}
                >
                  <Ionicons name="send-outline" size={20} color="#FF6B9D" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  iconGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  diamondIcon: {
    width: 16,
    height: 16,
    backgroundColor: "#FFF",
    transform: [{ rotate: "45deg" }],
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  menuButton: {
    padding: 4,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messageContainer: {
    marginVertical: 8,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  assistantMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#FF6B9D",
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageActions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  loadingBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
  },
  typingIndicator: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8E8E93",
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  quickActionButton: {
    backgroundColor: "#FF6B9D",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  quickActionText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center", // Changed from "flex-end" to "center"
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  messageInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    maxHeight: 100,
    minHeight: 20,
    textAlignVertical: "center", // Ensure text is vertically centered
    paddingTop: 0, // Reset padding to prevent offset issues
    paddingBottom: 0,
  },
  voiceButton: {
    marginBottom: 2,
  },
  voiceButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    padding: 8,
    marginBottom: -4,
  },
  avatarContainer: {
    width: 32, // Reduced size
    height: 32, // Reduced size
    borderRadius: 16, // Adjusted for new size
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8, // Adjusted margin
  },
  userAvatarContainer: {
    marginLeft: 8, // Adjusted margin
  },
  userAvatarText: {
    color: "#FFF",
    fontSize: 12, // Adjusted for new avatar size
    fontWeight: "600",
  },
});
