import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { createStyles } from "@utils/createStyles";
import { router } from "expo-router";
import { BlurView } from "expo-blur";

export default function test() {
  return (
    <View style={styles.container}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>

      <Pressable
        style={styles.content}
        onPress={() => {
          router.push("/(sheets)/test2");
        }}
      >
        <Text>go to test2</Text>
        <Text>go to test2</Text>
        <Text>go to test2</Text>
        <Text>go to test2</Text>
        <Text>go to test2</Text>
        <Text>go to test2</Text>
      </Pressable>
    </View>
  );
}

const styles = createStyles(({ colors }) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  content: {
    width: 300,
    padding: 20,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
}));
