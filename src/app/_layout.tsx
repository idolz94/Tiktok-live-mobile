import "@declare";
import { BottomSheetProvider } from "@components/bottom-sheet/provider";
import { ToastProvider } from "@components/toast";
import { PopoverProvider } from "@components/popover";
import { useAuth } from "@features/auth/hooks/use-auth";
import { TikTokLiveSocketProvider } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { sessionExpiredEmitter } from "@utils/http/session-event";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Splash from "./splash";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return <RootContent />;
}

function RootContent() {
  const { isLoading, logout, user } = useAuth();

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

  // --- showStack chỉ bật 1 lần, không flicker false khi bootstrap re-run ---
  const showStackOnceRef = useRef(false);
  const showStack = isStackReady && !isLoading;
  if (showStack) showStackOnceRef.current = true;
  const shouldRenderStack = showStackOnceRef.current;
  // --- end showStack ---

  return (
    <>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <ToastProvider>
              <BottomSheetProvider>
                <PopoverProvider>
                <StatusBar style="dark" />
                  <View style={{ flex: 1 }}>
                    {shouldRenderStack && (
                      <View style={{ flex: 1 }} onLayout={handleRootLayout}>
                        {/* --- Live provider ở root: không unmount khi navigate order-detail/browser --- */}
                        <TikTokLiveSocketProvider hasHistory={user?.hasHistory}>
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
                          <Stack.Screen name="license-expired" />
                          <Stack.Screen name="popover-demo" />
                        </Stack>
                        </TikTokLiveSocketProvider>
                        {/* --- end Live provider --- */}
                      </View>
                    )}
                    {showSplashOverlay && (
                      <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        <Splash />
                      </View>
                    )}
                  </View>
                </PopoverProvider>
              </BottomSheetProvider>
            </ToastProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </>
  );
}
