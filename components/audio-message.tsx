import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AudioMessageProps {
  uri: string;
  duration: number;
  isUserMessage: boolean;
}

const AudioMessage: React.FC<AudioMessageProps> = ({
  uri,
  duration,
  isUserMessage,
}) => {
  const player = useAudioPlayer(uri);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (player) {
      const listener = player.addListener("playbackStatusUpdate", (status) => {
        setIsPlaying(status.isPlaying);
        setCurrentTime(status.currentTime);
        setIsLoading(status.isBuffering || !status.isLoaded);
      });
      setIsLoading(!player.isLoaded);

      return () => {
        if (player) {
          listener.remove(); // Correct way to remove the listener
        }
      };
    }
    return undefined;
  }, [player]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const togglePlayPause = () => {
    if (player) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    }
  };

  return (
    <View
      style={[
        styles.audioBubble,
        isUserMessage ? styles.userAudioBubble : styles.assistantAudioBubble,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFF" />
      ) : (
        <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={20}
            color={isUserMessage ? "#FFF" : "#E5E5E7"}
          />
        </TouchableOpacity>
      )}

      <Text
        style={[
          styles.audioDuration,
          { color: isUserMessage ? "#FFF" : "#E5E5E7" },
        ]}
      >
        {formatTime(currentTime)} / {formatTime(duration / 1000)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  audioBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    maxWidth: "85%",
  },
  userAudioBubble: {
    backgroundColor: "#FF6B9D",
    borderBottomRightRadius: 6,
  },
  assistantAudioBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomLeftRadius: 6,
  },
  playButton: {
    marginRight: 10,
  },
  audioDuration: {
    fontSize: 14,
  },
});

export default AudioMessage;
