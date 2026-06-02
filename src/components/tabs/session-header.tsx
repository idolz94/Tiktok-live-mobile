import { LiveStatusPill } from "./live-status-pill";
import type { LiveHistoryItem } from "@modules/tiktok-live/types";
import { formatDate, formatDuration } from "@utils/comment";
import { createStyles } from "@utils/createStyles";
import { formatTime } from "@utils/date";
import { Text, View } from "react-native";

export const SessionHeader = ({
  isConnected,
  status,
  tiktokUsername,
  currentLiveSession,
  liveDurationSeconds,
  liveNowText,
}: {
  isConnected: boolean;
  status: string;
  tiktokUsername: string;
  currentLiveSession: LiveHistoryItem | null;
  liveDurationSeconds: number;
  liveNowText: string;
}) => {
  const isRunning = Boolean(
    currentLiveSession?.startedAt && !currentLiveSession?.endedAt,
  );
  const startTime = formatTime(currentLiveSession?.startedAt);
  const endTime = isRunning
    ? liveNowText
    : formatTime(currentLiveSession?.endedAt);

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
            ▣ phiên {formatDate(currentLiveSession.startedAt)} {startTime} -{" "}
            {endTime}{" "}
            <Text style={styles.duration}>
              ({formatDuration(liveDurationSeconds)})
            </Text>
          </Text>
        ) : (
          <Text style={styles.sessionText}>▣ Đang chờ comment đầu tiên...</Text>
        )}
        <Text style={styles.username}>☻ {tiktokUsername}</Text>
      </View>

      <LiveStatusPill isConnected={isConnected} status={status} />
    </View>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  header: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  back: { color: colors.textLight, width: 28, ...textPresets.fs40_400 },
  title: { color: colors.text, ...textPresets.fs24_900 },
  info: { marginBottom: 14 },
  sessionText: {
    color: colors.text,
    lineHeight: 26,
    ...textPresets.fs18_900,
  },
  duration: { color: colors.mediumGray },
  username: {
    marginTop: 8,
    color: colors.text,
    ...textPresets.fs22_900,
  },
}));
