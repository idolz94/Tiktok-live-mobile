import { Icon } from "@components/icon";
import { LinearGradient } from "@components/linear-gradient";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { LiveHistoryItem } from "@features/tiktok-live/types/types";
import { formatDuration, removeAt } from "@features/tiktok-live/utils/comment";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { router } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- date helpers ---

function getDateKey(dateString: string) {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTotalDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `Live ${h} giờ ${m} phút`;
  return `Live ${m} phút`;
}

function formatTimeRange(startedAt: string, endedAt: string | null) {
  const fmt = (d: string) =>
    new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  if (!endedAt) return `Phiên ${fmt(startedAt)}`;
  return `Phiên ${fmt(startedAt)} - ${fmt(endedAt)}`;
}

/** Parse dd/mm/yyyy → Date at start of day */
function parseInputDate(value: string): Date | null {
  const parts = value.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y || y < 2000) return null;
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return null;
  return date;
}

function todayStr() {
  return new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function daysAgoStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// --- types ---

type DateRange = { from: Date | null; to: Date | null };

type DateGroup = {
  dateKey: string;
  totalDuration: number;
  sessions: LiveHistoryItem[];
};

// --- helpers ---

function sessionMatchesRange(session: LiveHistoryItem, range: DateRange) {
  if (!range.from && !range.to) return true;
  const d = new Date(session.startedAt);
  d.setHours(0, 0, 0, 0);
  if (range.from && d < range.from) return false;
  if (range.to) {
    const to = new Date(range.to);
    to.setHours(23, 59, 59, 999);
    if (d > to) return false;
  }
  return true;
}

// --- DateRangeSheet ---

const PRESETS = [
  { label: "Hôm nay", from: () => todayStr(), to: () => todayStr() },
  { label: "7 ngày", from: () => daysAgoStr(6), to: () => todayStr() },
  { label: "30 ngày", from: () => daysAgoStr(29), to: () => todayStr() },
  { label: "Tháng này", from: () => daysAgoStr(new Date().getDate() - 1), to: () => todayStr() },
];

function DateRangeSheet({
  range,
  onApply,
  onClear,
  onClose,
}: {
  range: DateRange;
  onApply: (r: DateRange) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const { colors, textPresets } = useThemes();

  const toInput = (d: Date | null) =>
    d
      ? d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "";

  const [fromText, setFromText] = useState(toInput(range.from));
  const [toText, setToText] = useState(toInput(range.to));

  const applyPreset = (from: string, to: string) => {
    setFromText(from);
    setToText(to);
  };

  const handleApply = () => {
    const from = parseInputDate(fromText);
    const to = parseInputDate(toText);
    onApply({ from, to });
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  return (
    <View style={sheetStyles.container}>
      <Text style={[sheetStyles.title, { color: colors.neutral900, ...textPresets.fs16_600 }]}>
        Lọc theo ngày
      </Text>

      <View style={sheetStyles.presetRow}>
        {PRESETS.map((p) => (
          <Pressable
            key={p.label}
            style={[sheetStyles.preset, { backgroundColor: colors.neutral50, borderRadius: 99 }]}
            onPress={() => applyPreset(p.from(), p.to())}
          >
            <Text style={[sheetStyles.presetText, { color: colors.neutral500, ...textPresets.fs12_500 }]}>
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={sheetStyles.inputRow}>
        <View style={sheetStyles.inputWrap}>
          <Text style={[sheetStyles.inputLabel, { color: colors.neutral400, ...textPresets.fs12_400 }]}>
            Từ ngày
          </Text>
          <TextInput
            style={[sheetStyles.input, { color: colors.neutral900, borderColor: colors.neutral50, ...textPresets.fs14_400 }]}
            placeholder="dd/mm/yyyy"
            placeholderTextColor={colors.neutral300}
            value={fromText}
            onChangeText={setFromText}
            keyboardType="numeric"
          />
        </View>
        <View style={sheetStyles.inputDash} />
        <View style={sheetStyles.inputWrap}>
          <Text style={[sheetStyles.inputLabel, { color: colors.neutral400, ...textPresets.fs12_400 }]}>
            Đến ngày
          </Text>
          <TextInput
            style={[sheetStyles.input, { color: colors.neutral900, borderColor: colors.neutral50, ...textPresets.fs14_400 }]}
            placeholder="dd/mm/yyyy"
            placeholderTextColor={colors.neutral300}
            value={toText}
            onChangeText={setToText}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={sheetStyles.actions}>
        <Pressable
          style={[sheetStyles.btnClear, { borderColor: colors.neutral100, backgroundColor: colors.neutral50 }]}
          onPress={handleClear}
        >
          <Text style={[sheetStyles.btnClearText, { color: colors.neutral500, ...textPresets.fs14_500 }]}>
            Xóa lọc
          </Text>
        </Pressable>
        <Pressable
          style={[sheetStyles.btnApply, { backgroundColor: colors.primary }]}
          onPress={handleApply}
        >
          <Text style={[sheetStyles.btnApplyText, { color: colors.neutral100, ...textPresets.fs14_500 }]}>
            Áp dụng
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const sheetStyles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },
  title: { marginBottom: 16, textAlign: "center" },
  presetRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  preset: { paddingHorizontal: 14, paddingVertical: 8 },
  presetText: {},
  inputRow: { flexDirection: "row", alignItems: "center", columnGap: 12, marginBottom: 24 },
  inputWrap: { flex: 1, rowGap: 6 },
  inputLabel: {},
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputDash: { width: 12, height: 1, backgroundColor: "#ccc", marginTop: 20 },
  actions: { flexDirection: "row", columnGap: 12 },
  btnClear: { flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  btnClearText: {},
  btnApply: { flex: 2, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnApplyText: {},
});

// --- subcomponents ---

const SessionRow = memo(
  ({ session, isLast, onPress }: { session: LiveHistoryItem; isLast: boolean; onPress: (id: string) => void }) => {
    const handlePress = useCallback(() => onPress(session.id), [session.id, onPress]);
    return (
      <>
        <Pressable style={styles.sessionRow} onPress={handlePress}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>
              {formatTimeRange(session.startedAt, session.endedAt)}
            </Text>
            <View style={styles.sessionMeta}>
              <Icon name="group_user" size={12} tintColor="neutral300" />
              <Text style={styles.sessionMetaText}>{removeAt(session.username)}</Text>
              <View style={styles.metaDivider} />
              <Icon name="clock" size={12} tintColor="neutral300" />
              <Text style={styles.sessionMetaText}>
                {formatDuration(Number(session.durationSeconds || 0))}
              </Text>
            </View>
          </View>
          <Icon name="arrow_down" size={16} tintColor="neutral400" />
        </Pressable>
        {!isLast && <View style={styles.rowSeparator} />}
      </>
    );
  },
);

const DayCard = memo(
  ({ group, collapsed, onToggle, onPressSession }: {
    group: DateGroup;
    collapsed: boolean;
    onToggle: (key: string) => void;
    onPressSession: (id: string) => void;
  }) => {
    const { shadows } = useThemes();
    const handleToggle = useCallback(() => onToggle(group.dateKey), [group.dateKey, onToggle]);
    return (
      <View style={[styles.dayCard, shadows.sd2]}>
        <Pressable style={styles.groupHeader} onPress={handleToggle}>
          <View style={styles.groupDot} />
          <Text style={styles.groupDateText}>{group.dateKey}</Text>
          <View style={styles.groupHeaderDivider} />
          <Text style={styles.groupDurationText}>{formatTotalDuration(group.totalDuration)}</Text>
          <View style={collapsed ? styles.iconRotated : undefined}>
            <Icon name="arrow_down" size={16} tintColor="neutral400" />
          </View>
        </Pressable>
        {!collapsed && group.sessions.map((session, si) => (
          <SessionRow
            key={session.id}
            session={session}
            isLast={si === group.sessions.length - 1}
            onPress={onPressSession}
          />
        ))}
      </View>
    );
  },
);

// --- main ---

export const LiveHistoryScreen = memo(() => {
  const { top } = useSafeAreaInsets();
  const { colors } = useThemes();
  const { liveHistory, reloadLiveHistory } = useTikTokLiveSocketContext();
  const { show, hide } = useBottomSheet();

  const [refreshing, setRefreshing] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });

  const hasFilter = !!dateRange.from || !!dateRange.to;

  const groups = useMemo<DateGroup[]>(() => {
    const filtered = liveHistory.filter(
      (s) =>
        (Number(s.commentCount || 0) > 0 || Number(s.orderCount || s.orders?.length || 0) > 0) &&
        sessionMatchesRange(s, dateRange),
    );
    const map = new Map<string, DateGroup>();
    filtered.forEach((session) => {
      const key = getDateKey(session.startedAt);
      if (!map.has(key)) map.set(key, { dateKey: key, totalDuration: 0, sessions: [] });
      const group = map.get(key)!;
      group.sessions.push(session);
      group.totalDuration += Number(session.durationSeconds || 0);
    });
    return Array.from(map.values());
  }, [liveHistory, dateRange]);

  const toggleCollapse = useCallback((key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handlePressSession = useCallback((id: string) => {
    router.push({ pathname: "/live-session-detail", params: { id } });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reloadLiveHistory();
    setRefreshing(false);
  }, [reloadLiveHistory]);

  const openFilter = useCallback(() => {
    show({
      showDragIndicator: true,
      content: (
        <DateRangeSheet
          range={dateRange}
          onApply={setDateRange}
          onClear={() => setDateRange({ from: null, to: null })}
          onClose={hide}
        />
      ),
    });
  }, [dateRange, hide, show]);

  const filterLabel = useMemo(() => {
    if (!hasFilter) return null;
    const fmt = (d: Date) =>
      d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    if (dateRange.from && dateRange.to) return `${fmt(dateRange.from)} – ${fmt(dateRange.to)}`;
    if (dateRange.from) return `Từ ${fmt(dateRange.from)}`;
    return `Đến ${fmt(dateRange.to!)}`;
  }, [dateRange, hasFilter]);

  const renderDayCard = useCallback(
    ({ item }: { item: DateGroup }) => (
      <DayCard
        group={item}
        collapsed={!!collapsed[item.dateKey]}
        onToggle={toggleCollapse}
        onPressSession={handlePressSession}
      />
    ),
    [collapsed, handlePressSession, toggleCollapse],
  );

  const keyExtractor = useCallback((item: DateGroup) => item.dateKey, []);

  const listEmpty = groups.length === 0;

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.headerBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <Text style={styles.headerTitle}>Lịch Sử Live</Text>
        <Pressable
          style={[styles.headerButton, hasFilter && { backgroundColor: colors.primary }]}
          onPress={openFilter}
        >
          <Icon name="filter" size={20} tintColor={hasFilter ? "#ffffff" : "#000000"} />
        </Pressable>
      </View>

      {hasFilter && (
        <View style={styles.filterBadgeRow}>
          <View style={[styles.filterBadge, { backgroundColor: colors.neutral50 }]}>
            <Icon name="clock" size={12} tintColor="neutral400" />
            <Text style={styles.filterBadgeText}>{filterLabel}</Text>
            <Pressable onPress={() => setDateRange({ from: null, to: null })} hitSlop={8}>
              <Icon name="close" size={12} tintColor="neutral400" />
            </Pressable>
          </View>
        </View>
      )}

      {listEmpty ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Icon name="clock" size={32} tintColor="neutral300" />
          </View>
          <Text style={styles.emptyTitle}>
            {hasFilter ? "Không có phiên nào trong khoảng này" : "Chưa có lịch sử LIVE"}
          </Text>
          <Text style={styles.emptyText}>
            {hasFilter
              ? "Thử chọn khoảng thời gian khác."
              : "Các phiên live có comment sẽ xuất hiện ở đây."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderDayCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
});

const styles = createStyles(({ colors, textPresets }) => ({
  root: {
    flex: 1,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    minHeight: 119,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 28,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  filterBadgeRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
  },
  filterBadge: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  filterBadgeText: {
    color: colors.neutral500,
    ...textPresets.fs12_500,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    rowGap: 12,
  },
  dayCard: {
    borderRadius: 16,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  groupDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  groupDateText: {
    color: colors.neutral500,
    ...textPresets.fs14_500,
  },
  groupHeaderDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.neutral100,
  },
  groupDurationText: {
    flex: 1,
    color: colors.neutral300,
    ...textPresets.fs12_400,
  },
  iconRotated: {
    transform: [{ rotate: "-90deg" }],
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sessionInfo: {
    flex: 1,
    rowGap: 4,
  },
  sessionTitle: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  sessionMeta: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
  },
  sessionMetaText: {
    color: colors.neutral300,
    ...textPresets.fs12_400,
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.neutral300,
    marginHorizontal: 2,
  },
  rowSeparator: {
    height: 0.5,
    marginLeft: 16,
    backgroundColor: colors.neutral100,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    rowGap: 8,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.neutral50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    color: colors.neutral500,
    ...textPresets.fs14_500,
    textAlign: "center",
  },
  emptyText: {
    color: colors.neutral300,
    ...textPresets.fs12_400,
    textAlign: "center",
  },
}));
