import { useAuth } from "@modules/auth/hooks/use-auth";
import { loadBoolean, STORAGE_KEYS } from "@utils/storage";
import { Redirect } from "expo-router";

export default function Index() {
  const { user, isLoading } = useAuth();
  const onboardingCompleted =
    loadBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED) ?? false;

  if (isLoading) {
    return null;
  }

  if (!!user) return <Redirect href={"./(tabs)"} />;

  if (!onboardingCompleted) return <Redirect href={"./onboarding"} />;

  return <Redirect href="/(auth)" />;
}
