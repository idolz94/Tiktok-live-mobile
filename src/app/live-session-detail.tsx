import { LiveSessionDetailScreen } from "@features/tiktok-live/components/live-session-detail-screen";
import { useLocalSearchParams } from "expo-router";

export default function LiveSessionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LiveSessionDetailScreen sessionId={id ?? ""} />;
}
