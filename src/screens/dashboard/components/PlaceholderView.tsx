import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LiveHistoryItem } from "@/features/tiktok-live/types";
import { formatDuration, removeAt } from "@/utils/comment";

function getDateKey(dateString: string) {
  return new Date(dateString).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function PlaceholderView({ liveHistory }: { liveHistory: LiveHistoryItem[] }) {
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
          <Text style={styles.groupTitle}>{date} - LIVE {formatDuration(items.reduce((sum, item) => sum + (item.durationSeconds || 0), 0))}</Text>
          {items.map((item) => (
            <View key={item.sessionId} style={styles.item}>
              <Text style={styles.time}>▻ Phiên {new Date(item.startedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - {item.endedAt ? new Date(item.endedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "..."} ({formatDuration(item.durationSeconds || 0)})</Text>
              <Text style={styles.username}>☻ {removeAt(item.username)}</Text>
              <Text style={styles.count}>{item.commentCount || item.comments?.length || 0} comment</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 22 },
  group: { borderRadius: 12, backgroundColor: "#fff", padding: 14, marginBottom: 12 },
  groupTitle: { fontSize: 16, fontWeight: "900", color: "#273044", marginBottom: 10 },
  item: { borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingVertical: 10 },
  time: { fontSize: 15, fontWeight: "800", color: "#334155" },
  username: { marginTop: 4, fontSize: 15, fontWeight: "800", color: "#334155" },
  count: { marginTop: 4, color: "#94a3b8" },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { color: "#64748b", fontWeight: "700" }
});
