import { useAuth } from "@features/auth/hooks/use-auth";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { user } = useAuth();

  if (user?.canUseApp) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
