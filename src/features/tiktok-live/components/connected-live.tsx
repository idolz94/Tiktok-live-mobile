import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LiveComment } from "@app-types/index";
import { createStyles } from "@utils/createStyles";
import { ConnectedLiveProps } from "../types/types";
import { useConnectedLive } from "../hooks/use-connected-live";
import { BuyingIntentQueue } from "./buying-intent-queue";
import { CommentCardItem } from "./comment-card-item";
import { DevTipsPreview } from "./dev-tips-preview";

const tabs = [
  { key: "all", label: "Tất cả" },
  { key: "priority", label: "Ưu tiên" },
] as const;

type LiveTab = (typeof tabs)[number]["key"];

const keyExtractor = (item: LiveComment) => item.id;

export function ConnectedLive(props: ConnectedLiveProps) {
  const {
    comments,
    isConnected,
    latestOrderRecommendation,
    listRef,
    isCommentOrderCreated,
    handleCreateOrder,
    handlePrintOrder,
  } = useConnectedLive(props);
  const [tab, setTab] = useState<LiveTab>("all");

  const reversedComments = useMemo(() => [...comments].reverse(), [comments]);

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

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {tabs.map((item) => {
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

      {tab === "all" ? (
        isConnected && comments.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>
              Đang lấy comment, vui lòng chờ trong giây lát
            </Text>
          </View>
        ) : (
          <FlashList
            ref={listRef}
            data={reversedComments}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
          />
        )
      ) : (
        <>
          {latestOrderRecommendation ? (
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>Gợi ý tạo đơn</Text>
              <Text style={styles.recommendationText}>
                {latestOrderRecommendation.displayName ||
                  latestOrderRecommendation.tiktokUsername}{" "}
                muốn mua{" "}
                {latestOrderRecommendation.matchedPreset.name ||
                  latestOrderRecommendation.matchedPreset.code}
              </Text>
              <Text style={styles.recommendationMeta}>
                Mã {latestOrderRecommendation.matchedPreset.code} · Độ tin cậy{" "}
                {latestOrderRecommendation.confidence}%
              </Text>
            </View>
          ) : null}
          <BuyingIntentQueue />
        </>
      )}

      <DevTipsPreview />
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flex: 1,
    paddingTop: 12,
    // offset for bottom tab bar + safe padding
    paddingBottom: 48 * 2 - 16,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
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
  listContent: {
    paddingHorizontal: 16,
  },
  recommendationCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
  },
  recommendationTitle: {
    color: colors.primary,
    ...textPresets.fs12_500,
  },
  recommendationText: {
    marginTop: 4,
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  recommendationMeta: {
    marginTop: 4,
    color: colors.neutral500,
    ...textPresets.fs12_400,
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
