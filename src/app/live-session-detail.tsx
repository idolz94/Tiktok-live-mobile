import { LiveSessionDetailScreen } from "@features/tiktok-live/screens/live-session-detail";
import { useLocalSearchParams } from "expo-router";

export default function LiveSessionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LiveSessionDetailScreen sessionId={id ?? ""} />;
}
