import { LiveHistoryItem } from "@modules/tiktok-live/types";
import { formatDuration, removeAt } from "@utils/comment";
import { createStyles } from "@utils/createStyles";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";

const getDateKey = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const PlaceholderView = ({
  liveHistory,
}: {
  liveHistory: LiveHistoryItem[];
}) => {
  const groups = useMemo(() => {
    const map = new Map<string, LiveHistoryItem[]>();
    liveHistory.forEach((item) => {
      const key = getDateKey(item.startedAt);
      map.set(key, [...(map.get(key) || []), item]);
    });
    return Array.from(map.entries());
  }, [liveHistory]);

  if (!liveHistory.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Chưa có lịch sử phiên LIVE.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {groups.map(([date, items]) => (
        <View key={date} style={styles.group}>
          <Text style={styles.groupTitle}>
            {date} - LIVE{" "}
            {formatDuration(
              items.reduce((sum, item) => sum + (item.durationSeconds || 0), 0),
            )}
          </Text>
          {items.map((item) => (
            <View key={item.sessionId} style={styles.item}>
              <Text style={styles.time}>
                ▻ Phiên{" "}
                {new Date(item.startedAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {item.endedAt
                  ? new Date(item.endedAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "..."}{" "}
                ({formatDuration(item.durationSeconds || 0)})
              </Text>
              <Text style={styles.username}>☻ {removeAt(item.username)}</Text>
              <Text style={styles.count}>
                {item.commentCount || item.comments?.length || 0} comment
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  container: { paddingBottom: 22 },
  group: {
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 12,
  },
  groupTitle: {
    color: colors.text,
    ...textPresets.fs16_900,
    marginBottom: 10,
  },
  item: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
  },
  time: { color: colors.textGray, ...textPresets.fs15_800 },
  username: { marginTop: 4, color: colors.textGray, ...textPresets.fs15_800 },
  count: { marginTop: 4, color: colors.textLightMuted },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { color: colors.textMuted, ...textPresets.fs12_800 },
}));
