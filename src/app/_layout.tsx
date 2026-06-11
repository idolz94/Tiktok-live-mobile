import "@declare";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@utils/storage/clerk-token-cache";
import { CLERK_PUBLISHABLE_KEY } from "@constants/config";
import { ClerkTokenSync } from "@components/auth/clerk-token-sync";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Splash from "./splash";
import { BottomSheetProvider } from "@components/bottom-sheet/provider";
import { sessionExpiredEmitter } from "@utils/http/session-event";
import { useAuth } from "@modules/auth/hooks/use-auth";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <RootContent />
    </ClerkProvider>
  );
}

function RootContent() {
  const { isLoading, logout } = useAuth();

  const [isStackReady, setIsStackReady] = useState(false);
  const [showSplashOverlay, setShowSplashOverlay] = useState(true);

  const splashHiddenRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStackReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = sessionExpiredEmitter.subscribe(() => {
      Alert.alert(
        "Phiên đăng nhập hết hạn",
        "Tài khoản của bạn vừa quá hạn đăng nhập, vui lòng đăng nhập lại",
        [
          {
            text: "OK",
            onPress: async () => {
              await logout();
              sessionExpiredEmitter.reset();
            },
          },
        ],
        { cancelable: false },
      );
    });

    return unsubscribe;
  }, [logout]);

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
    <>
      <ClerkTokenSync />
      <SafeAreaProvider>
        <KeyboardProvider>
          <BottomSheetProvider>
            <StatusBar style="dark" />
            <View style={{ flex: 1 }}>
              {showStack && (
                <View style={{ flex: 1 }} onLayout={handleRootLayout}>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="onboarding" />
                    <Stack.Screen name="(tabs)" />
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
          </BottomSheetProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </>
  );
}
