import "@declare";
import { useAuth } from "@modules/auth/hooks/use-auth";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Splash from "./splash";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoading } = useAuth();

  const [isStackReady, setIsStackReady] = useState(false);
  const [showSplashOverlay, setShowSplashOverlay] = useState(true);

  const splashHiddenRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStackReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRootLayout = useCallback(() => {
    if (splashHiddenRef.current) return;
    if (!isStackReady || isLoading) return;

    splashHiddenRef.current = true;

    SplashScreen.hideAsync();

    setTimeout(() => {
      setShowSplashOverlay(false);
    }, 300);
  }, [isStackReady, isLoading]);

  const showStack = isStackReady && !isLoading;

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          {showStack && (
            <View style={{ flex: 1 }} onLayout={handleRootLayout}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="order-detail" />
                <Stack.Screen name="(sheets)" />
              </Stack>
            </View>
          )}

          {showSplashOverlay && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Splash />
            </View>
          )}
        </View>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
