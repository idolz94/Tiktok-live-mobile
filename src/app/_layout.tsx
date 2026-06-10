import "@declare";
import { useAuth } from "@modules/auth/hooks/use-auth";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Splash from "./splash";
import { BottomSheetProvider } from "@components/bottom-sheet/provider";
import { sessionExpiredEmitter } from "@utils/http/session-event";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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

  // Lắng nghe sự kiện hết hạn phiên đăng nhập để hiển thị Alert thông báo duy nhất tại Root
  useEffect(() => {
    const unsubscribe = sessionExpiredEmitter.subscribe(() => {
      Alert.alert(
        "Phiên đăng nhập hết hạn",
        "Tài khoản của bạn vừa quá hạn đăng nhập, vui lòng đăng nhập lại",
        [
          {
            text: "Đăng nhập lại",
            onPress: async () => {
              await logout();
              sessionExpiredEmitter.reset();
            },
          },
        ],
        { cancelable: false }
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
  );
}
