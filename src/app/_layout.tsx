import "@declare";
import { BottomSheetProvider } from "@components/bottom-sheet/provider";
import { useAuth } from "@features/auth/hooks/use-auth";
import { sessionExpiredEmitter } from "@utils/http/session-event";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Splash from "./splash";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return <RootContent />;
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
                    <Stack.Screen name="printer-settings" />
                    <Stack.Screen name="shipping-settings" />
                    <Stack.Screen name="(sheets)" />
                    <Stack.Screen name="manage-tiktok-channel" />
                    <Stack.Screen name="order-detail" />
                    <Stack.Screen name="customer-detail" />
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
