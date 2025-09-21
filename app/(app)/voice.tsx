import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VoiceScreen() {
  const [isListening, setIsListening] = useState(true);
  const [transcription, setTranscription] = useState(
    "Press and hold to record"
  );
  const [subtitle, setSubtitle] = useState("Release to send");

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      // Pulse animation for the voice button
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0.8,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Blinking cursor animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(1);
      opacityAnim.setValue(1);
    }

    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
        router.back();
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, [isListening]);

  const record = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsListening(true);
      setTranscription("Recording...");
    } catch (error) {
      console.error("Failed to start recording", error);
      Alert.alert("Recording Error", "Failed to start recording.");
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      setIsListening(false);
      setTranscription("Processing...");

      const uri = audioRecorder.uri;
      const duration = recorderState.durationMillis;
      console.log("Recording stopped and stored at", uri, "duration", duration);

      if (uri) {
        // Store audioUri and duration in AsyncStorage
        await AsyncStorage.setItem(
          "tempAudioMessage",
          JSON.stringify({ audioUri: uri, duration: duration })
        );
        router.back();
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
      Alert.alert("Recording Error", "Failed to stop recording.");
    }
  };

  const handleVoiceToggle = () => {
    // This will be managed by onPressIn and onPressOut for recording
  };

  const handleStop = () => {
    stopRecording();
  };

  const renderWaveVisualization = () => (
    <Animated.View
      style={[styles.waveContainer, { transform: [{ scale: waveAnim }] }]}
    >
      {/* Outer ring */}
      <View style={styles.waveRingOuter} />

      {/* Middle ring */}
      <View style={styles.waveRingMiddle} />

      {/* Inner ring */}
      <View style={styles.waveRingInner} />

      {/* Center circle */}
      <LinearGradient
        colors={["#FF6B9D", "#C44DC4", "#8B5CF6"]}
        style={styles.waveCenterGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.waveCenter} />
      </LinearGradient>
    </Animated.View>
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
            <Text style={styles.headerTitle}>Voice Message</Text>
            <Text style={styles.headerSubtitle}>Press and hold to record</Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={stopRecording}>
            <Ionicons name="close-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Voice Visualization */}
        <View style={styles.visualizationContainer}>
          {renderWaveVisualization()}

          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionText}>
              {recorderState.isRecording ? "Recording..." : transcription}
              <Animated.Text style={[styles.cursor, { opacity: opacityAnim }]}>
                |
              </Animated.Text>
            </Text>
            <Text style={styles.subtitleText}>{subtitle}</Text>
          </View>
        </View>

        {/* Voice Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="refresh-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainVoiceButton}
            onPressIn={record}
            onPressOut={stopRecording}
          >
            <Animated.View
              style={[
                styles.mainVoiceButtonInner,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: recorderState.isRecording
                    ? "#FF6B9D"
                    : "#8E8E93",
                },
              ]}
            >
              <LinearGradient
                colors={
                  recorderState.isRecording
                    ? ["#FF6B9D", "#C44DC4"]
                    : ["#8E8E93", "#6B7280"]
                }
                style={styles.voiceButtonGradient}
              >
                <Ionicons
                  name={
                    recorderState.isRecording
                      ? "mic-outline"
                      : "mic-off-outline"
                  }
                  size={32}
                  color="#FFF"
                />
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={stopRecording}
          >
            <Ionicons name="close-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>
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
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    marginLeft: 16,
  },
  visualizationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  waveContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
  },
  waveRingOuter: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(255, 107, 157, 0.2)",
    backgroundColor: "rgba(255, 107, 157, 0.05)",
  },
  waveRingMiddle: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "rgba(255, 107, 157, 0.3)",
    backgroundColor: "rgba(255, 107, 157, 0.08)",
  },
  waveRingInner: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "rgba(255, 107, 157, 0.5)",
    backgroundColor: "rgba(255, 107, 157, 0.15)",
  },
  waveCenterGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  waveCenter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  transcriptionContainer: {
    alignItems: "center",
  },
  transcriptionText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 12,
  },
  cursor: {
    color: "#FF6B9D",
    fontSize: 24,
    fontWeight: "300",
  },
  subtitleText: {
    color: "#8E8E93",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "400",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
    paddingHorizontal: 40,
    gap: 50,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  mainVoiceButton: {
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  mainVoiceButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
  },
  voiceButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
