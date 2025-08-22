// src/screens/SplashScreen.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";

const SplashScreen = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    // 2 sec baad app ka main navigator khulega
    const timer = setTimeout(() => {
      navigation.replace("AppNavigator"); 
      // 👆 Replace with your main navigator name (RootNavigator/AppNavigator)
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* App Name Animation */}
      <Animated.Text
        style={styles.title}
        entering={ZoomIn.duration(800)}
        exiting={FadeOut}
      >
        VakyaSangam
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        style={styles.subtitle}
        entering={FadeIn.delay(800).duration(1000)}
      >
        Learn languages the fun way ✨
      </Animated.Text>

      {/* Loader */}
      <ActivityIndicator size="large" color="#FFA500" style={{ marginTop: 20 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // splash background
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFA500",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginTop: 8,
  },
});

export default SplashScreen;
