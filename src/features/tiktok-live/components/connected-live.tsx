import { LiveComment } from "@app-types/index";
import { FlashList } from "@shopify/flash-list";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ConnectedLiveProps } from "../types/types";
import { CommentCardItem } from "./comment-card-item";
import { DevTipsPreview } from "./dev-tips-preview";
import { useConnectedLive } from "../hooks/use-connected-live";
import { BuyingIntentQueue } from "./buying-intent-queue";

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
      latestOrderRecommendation,
      listRef,
      isCommentOrderCreated,
      handleCreateOrder,
      handlePrintOrder,
    } = useConnectedLive(props);
    const [tab, setTab] = useState<LiveTab>("all");

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

    const renderTabs = () => (
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
    );

    const renderOrderRecommendation = () => {
      if (!latestOrderRecommendation) return null;

      const preset = latestOrderRecommendation.matchedPreset;

      return (
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>Gợi ý tạo đơn</Text>
          <Text style={styles.recommendationText}>
            {latestOrderRecommendation.displayName || latestOrderRecommendation.tiktokUsername} muốn mua {preset.name || preset.code}
          </Text>
          <Text style={styles.recommendationMeta}>
            Mã {preset.code} · Độ tin cậy {latestOrderRecommendation.confidence}%
          </Text>
        </View>
      );
    };

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

      return (
        <FlashList
          ref={listRef}
          data={[...comments].reverse()}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
        />
      );
    };

    return (
      <View style={styles.container}>
        {renderTabs()}
        {tab === "all" ? (
          renderComments()
        ) : (
          <>
            {renderOrderRecommendation()}
            <BuyingIntentQueue />
          </>
        )}
        <DevTipsPreview />
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
