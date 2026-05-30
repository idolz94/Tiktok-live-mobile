import { StyleSheet, Text, View } from "react-native";
import LiveStatusPill from "@/components/LiveStatusPill";
import { formatDate, formatDuration } from "@/utils/comment";
import { formatTime } from "@/utils/date";
import type { LiveHistoryItem } from "@/features/tiktok-live/types";

export default function SessionHeader({
  isConnected,
  status,
  tiktokUsername,
  currentLiveSession,
  liveDurationSeconds,
  liveNowText
}: {
  isConnected: boolean;
  status: string;
  tiktokUsername: string;
  currentLiveSession: LiveHistoryItem | null;
  liveDurationSeconds: number;
  liveNowText: string;
}) {
  const isRunning = Boolean(currentLiveSession?.startedAt && !currentLiveSession?.endedAt);
  const startTime = formatTime(currentLiveSession?.startedAt);
  const endTime = isRunning ? liveNowText : formatTime(currentLiveSession?.endedAt);

  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.back}>‹</Text>
        <Text style={styles.title}>Chi tiết phiên LIVE</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.info}>
        {currentLiveSession?.startedAt ? (
          <Text style={styles.sessionText}>
            ▣ phiên {formatDate(currentLiveSession.startedAt)} {startTime} - {endTime} <Text style={styles.duration}>({formatDuration(liveDurationSeconds)})</Text>
          </Text>
        ) : (
          <Text style={styles.sessionText}>▣ Đang chờ comment đầu tiên...</Text>
        )}
        <Text style={styles.username}>☻ {tiktokUsername}</Text>
      </View>

      <LiveStatusPill isConnected={isConnected} status={status} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#fff7d6", paddingHorizontal: 18, paddingTop: 18, paddingBottom: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  back: { fontSize: 40, color: "#111827", width: 28 },
  title: { fontSize: 25, fontWeight: "900", color: "#273044" },
  info: { marginBottom: 14 },
  sessionText: { fontSize: 18, fontWeight: "900", color: "#273044", lineHeight: 26 },
  duration: { color: "#9ca3af" },
  username: { marginTop: 8, fontSize: 22, fontWeight: "900", color: "#273044" }
});
