/**
 * LiveSessionSummarySheet — tóm tắt nhanh 1 phiên live ngay khi bấm "Xem nhận xét" lúc disconnect,
 * thay vì router.push thẳng sang LiveSessionDetailScreen (report dày: stat grid + FlashList đơn có
 * filter + sub-navigation từ OrderItem). Sheet chỉ hiện insights + số liệu cơ bản (dùng chung
 * useLiveSessionDetail nên không tốn thêm fetch), có nút "Xem chi tiết đơn hàng" để vào màn đầy đủ
 * nếu seller cần drill-down.
 */
import { Button } from "@components/button";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { router } from "expo-router";
import { memo } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useLiveSessionDetail } from "../hooks/use-live-session-detail";
import { formatDuration, removeAt } from "../utils/comment";

type Props = {
  sessionId: string;
  onClose: () => void;
};

const StatChip = memo(
  ({ label, value, color }: { label: string; value: number; color: string }) => (
    <View style={styles.statChip}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  ),
);

StatChip.displayName = "StatChip";

export const LiveSessionSummarySheet = memo(({ sessionId, onClose }: Props) => {
  const { colors } = useThemes();
  const { session, insights, confirmedOrders, paidOrders, unpaidOrders, draftOrders } =
    useLiveSessionDetail(sessionId);

  const handleViewDetail = () => {
    onClose();
    router.push({ pathname: "/live-session-detail", params: { id: sessionId } });
  };

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Phiên live</Text>
        <Text style={styles.emptyText}>Không tìm thấy dữ liệu phiên live.</Text>
      </View>
    );
  }

  const highlights = insights?.highlights.slice(0, 3) ?? [];
  const hasInsightContent = Boolean(insights?.summary) || highlights.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      bounces={false}
    >
      <Text style={styles.title}>Nhận xét phiên live</Text>
      <Text style={styles.meta}>
        {removeAt(session.username)} · {formatDuration(Number(session.durationSeconds || 0))}
      </Text>

      <View style={styles.statsRow}>
        <StatChip label="Đã chốt" value={confirmedOrders} color={colors.success} />
        <StatChip label="Đã cọc" value={paidOrders} color={colors.info} />
        <StatChip label="Chưa cọc" value={unpaidOrders} color={colors.warning} />
        <StatChip label="Đơn nháp" value={draftOrders} color={colors.neutral500} />
      </View>

      {!insights && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải nhận xét...</Text>
        </View>
      )}

      {insights && insights.summary ? (
        <Text style={styles.summary}>{insights.summary}</Text>
      ) : null}

      {highlights.length > 0 && (
        <View style={styles.highlightList}>
          {highlights.map((highlight, idx) => (
            <View
              key={`${highlight.code}-${idx}`}
              style={[
                styles.highlightCard,
                {
                  backgroundColor:
                    highlight.level === "good"
                      ? colors.successLight
                      : highlight.level === "warning"
                        ? colors.warningLight
                        : colors.infoLight,
                },
              ]}
            >
              <Text style={styles.highlightTitle}>{highlight.title}</Text>
              <Text style={styles.highlightDetail}>{highlight.detail}</Text>
            </View>
          ))}
        </View>
      )}

      {insights && !hasInsightContent && (
        <Text style={styles.emptyText}>Chưa có nhận xét cho phiên này.</Text>
      )}

      <Button
        title="Xem chi tiết đơn hàng"
        type="gradient"
        onPress={handleViewDetail}
        containerStyle={styles.fullWidthBtn}
      />
    </ScrollView>
  );
});

LiveSessionSummarySheet.displayName = "LiveSessionSummarySheet";

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    maxHeight: 520,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    rowGap: 16,
  },
  title: {
    color: colors.neutral900,
    ...textPresets.fs16_600,
  },
  meta: {
    color: colors.neutral500,
    ...textPresets.fs12_400,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 10,
  },
  statChip: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 12,
    rowGap: 2,
  },
  statValue: {
    ...textPresets.fs20_600,
  },
  statLabel: {
    color: colors.neutral500,
    ...textPresets.fs12_400,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    paddingVertical: 4,
  },
  loadingText: {
    color: colors.neutral500,
    ...textPresets.fs12_400,
  },
  summary: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
    lineHeight: 20,
  },
  highlightList: {
    rowGap: 8,
  },
  highlightCard: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    rowGap: 2,
  },
  highlightTitle: {
    color: colors.neutral900,
    ...textPresets.fs12_500,
  },
  highlightDetail: {
    color: colors.neutral500,
    ...textPresets.fs12_400,
    lineHeight: 17,
  },
  emptyText: {
    color: colors.neutral500,
    ...textPresets.fs14_400,
    textAlign: "center",
    paddingVertical: 8,
  },
  fullWidthBtn: {
    marginTop: 4,
  },
}));
