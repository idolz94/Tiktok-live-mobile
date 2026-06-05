import { useAuth } from "@modules/auth/hooks/use-auth";
import { Redirect } from "expo-router";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)" />;
}
