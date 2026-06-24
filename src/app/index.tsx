import { useAuth } from "@features/auth/hooks/use-auth";
import { loadBoolean, STORAGE_KEYS } from "@utils/storage";
import { Redirect } from "expo-router";

export default function Index() {
  const { user, isLoading } = useAuth();
  const onboardingCompleted =
    loadBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED) ?? false;

  if (isLoading) {
    return null;
  }

  // START: Block toàn bộ app khi user tồn tại nhưng license không hợp lệ
  if (user && !user.canUseApp) return <Redirect href="./license-expired" />;
  // END: Block toàn bộ app khi user tồn tại nhưng license không hợp lệ

  if (!!user) return <Redirect href="./(tabs)" />;

  if (!onboardingCompleted) return <Redirect href={"./onboarding"} />;

  return <Redirect href="/(auth)" />;
}
