import "@declare";
import { Stack, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useAuth } from "@modules/auth/hooks/use-auth";
import { createStyles } from "@utils/createStyles";

export default function RootLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="order-detail" />
        </Stack>
        {user ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)" />}
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

const styles = createStyles(({ colors }) => ({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
}));
