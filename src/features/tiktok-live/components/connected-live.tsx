import { LiveComment } from "@app-types/index";
import { FlashList } from "@shopify/flash-list";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Icon } from "@components/icon";
import { ConnectedLiveProps } from "../types/types";
import { CommentCardItem } from "./comment-card-item";
import { useConnectedLive } from "../hooks/use-connected-live";
import { isPriorityComment } from "../utils/comment";

const tabs = [
  { key: "all", label: "Tất cả" },
  { key: "priority", label: "Ưu tiên" },
] as const;

type LiveTab = (typeof tabs)[number]["key"];

export const ConnectedLive = memo(
  (props: ConnectedLiveProps) => {
    const {
      comments,
      isConnected,
      listRef,
      scrollToBottom,
      isCommentOrderCreated,
      handleCreateOrder,
      handlePrintOrder,
    } = useConnectedLive(props);
    const [tab, setTab] = useState<LiveTab>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [q, setQ] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { width: winW } = useWindowDimensions();
    // ~50% viewport tới giữa màn, clamp để không tràn trên màn nhỏ/landscape
    const targetW = Math.min(280, Math.max(150, Math.round(winW * 0.5 - 16)));
    const widthSV = useSharedValue(0);

    const searchAnimStyle = useAnimatedStyle(() => ({
      width: widthSV.value,
      opacity: widthSV.value > 8 ? 1 : 0,
    }));

    const openSearch = useCallback(() => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      setSearchOpen(true);
      widthSV.value = withTiming(targetW, { duration: 220 });
      focusTimerRef.current = setTimeout(() => {
        if (!inputRef.current?.isFocused()) inputRef.current?.focus();
      }, 60);
    }, [widthSV, targetW]);

    const closeSearch = useCallback(() => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      widthSV.value = withTiming(0, { duration: 180 });
      setTimeout(() => {
        setSearchOpen(false);
        setSearchQuery("");
      }, 180);
    }, [widthSV]);

    useEffect(
      () => () => {
        if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      },
      [],
    );

    useEffect(() => {
      const t = setTimeout(() => setQ(searchQuery.trim()), 200);
      return () => clearTimeout(t);
    }, [searchQuery]);

    const keyExtractor = useCallback((item: LiveComment) => item.id, []);

    const renderItem = useCallback(
      ({ item }: { item: LiveComment }) => (
        <CommentCardItem
          item={item}
          onCreateOrder={handleCreateOrder}
          onPrintOrder={handlePrintOrder}
          isCommentOrderCreated={isCommentOrderCreated}
        />
      ),
      [handleCreateOrder, handlePrintOrder, isCommentOrderCreated],
    );

    const hasPriority = useMemo(() => comments.some(isPriorityComment), [comments]);

    const visibleTabs = useMemo(
      () => tabs.filter((t) => (t.key === "priority" ? hasPriority : true)),
      [hasPriority],
    );

    useEffect(() => {
      if (!hasPriority && tab === "priority") setTab("all");
    }, [hasPriority, tab]);

    // ponytail: đổi tab (Tất cả <-> Ưu tiên) đổi hẳn size mảng data — FlashList giữ nguyên
    // scroll offset cũ (đo theo list dài hơn/ngắn hơn) nên để trống 1 khoảng trên/dưới nhìn như
    // lỗi. Reset lại vị trí cuộn mỗi lần đổi tab, không animate (không phải tin nhắn mới).
    useEffect(() => {
      scrollToBottom(false);
    }, [tab, scrollToBottom]);

    const displayedComments = useMemo(
      () => (tab === "priority" ? comments.filter(isPriorityComment) : comments),
      [comments, tab],
    );

    const normalizeSearch = useCallback(
      (s: string) => String(s || "").removeAccent().replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase(),
      [],
    );

    const filteredBySearch = useMemo(() => {
      const needle = normalizeSearch(q);
      if (!needle) return displayedComments;
      return displayedComments.filter((c) => {
        const hay = `${String(c.comment || "")} ${String((c as any).displayName || "")} ${String((c as any).username || "")} ${String((c as any).platformUsername || "")}`;
        return normalizeSearch(hay).includes(needle);
      });
    }, [displayedComments, q, normalizeSearch]);

    const renderTabs = () => (
      <View style={styles.filterRow}>
        <View style={styles.tabs}>
          {visibleTabs.map((item) => {
            const active = tab === item.key;

            return (
              <Pressable
                key={item.key}
                onPress={() => setTab(item.key)}
                style={styles.tab}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.searchSlot}>
          {!searchOpen ? (
            <Pressable onPress={openSearch} hitSlop={8} style={styles.searchIconBtn}>
              <Icon name="search" size={18} tintColor="neutral500" />
            </Pressable>
          ) : (
            <Animated.View style={[styles.searchWrap, searchAnimStyle]}>
              <Icon name="search" size={14} tintColor="neutral300" />
              <TextInput
                ref={inputRef}
                autoFocus
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Tìm comment / @tên"
                placeholderTextColor="#A0A0A0"
                style={styles.searchInput}
                returnKeyType="search"
                clearButtonMode="never"
                onBlur={() => {
                  if (!searchQuery.trim()) closeSearch();
                }}
              />
              {searchQuery.length > 0 ? (
                <Pressable onPress={() => setSearchQuery("")} hitSlop={8} style={styles.searchClear}>
                  <Icon name="close" size={12} tintColor="neutral300" />
                </Pressable>
              ) : (
                <Pressable onPress={closeSearch} hitSlop={8} style={styles.searchCloseBtn}>
                  <Icon name="close" size={12} tintColor="neutral300" />
                </Pressable>
              )}
            </Animated.View>
          )}
        </View>
      </View>
    );

    const renderComments = () => {
      if (isConnected && comments.length === 0) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>
              Đang lấy comment, vui lòng chờ trong giây lát
            </Text>
          </View>
        );
      }

      if (filteredBySearch.length === 0) {
        if (q) {
          return (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Không tìm thấy “{q}”.</Text>
            </View>
          );
        }
        if (tab === "priority") {
          return (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chưa có comment ưu tiên.</Text>
            </View>
          );
        }
      }

      return (
        <FlashList
          ref={listRef}
          data={[...filteredBySearch].reverse()}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
        />
      );
    };

    return (
      <View style={styles.container}>
        {renderTabs()}
        {renderComments()}
      </View>
    );
  },
);

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 48 * 2 - 16,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  tab: {
    paddingVertical: 4,
  },
  tabText: {
    color: colors.neutral500,
    ...textPresets.fs14_500,
  },
  tabTextActive: {
    color: colors.primary,
  },
  searchSlot: {
    marginLeft: "auto",
    justifyContent: "center",
    height: 36,
  },
  searchIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border10,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border10,
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    color: colors.neutral900,
    ...textPresets.fs12_500,
  },
  searchClear: {
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  searchCloseBtn: {
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: colors.neutral900,
    ...textPresets.fs12_500,
    textAlign: "center",
  },
}));
