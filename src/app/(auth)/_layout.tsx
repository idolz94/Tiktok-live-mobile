import { useAuth } from "@features/auth/hooks/use-auth";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { user } = useAuth();

  // START: Block toàn bộ app khi user tồn tại nhưng license không hợp lệ
  if (user && !user.canUseApp) return <Redirect href="/license-expired" />;
  // END: Block toàn bộ app khi user tồn tại nhưng license không hợp lệ

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
