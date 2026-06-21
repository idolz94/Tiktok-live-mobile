import { LiveComment } from "@app-types/index";
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { createOrderCommentKey } from "@features/tiktok-live/utils/comment";
import { FlashList } from "@shopify/flash-list";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useEffect, useRef } from "react";
import type { ComponentRef } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { ConnectedLiveProps } from "../types/types";
import { CommentCardItem } from "./comment-card-item";

export const ConnectedLive = memo(
  ({ orderManager, onNavigateToOrders, onPrintOrder }: ConnectedLiveProps) => {
    const { comments, isConnected } = useTikTokLiveSocketContext();

    const listRef = useRef<ComponentRef<typeof FlashList<LiveComment>>>(null);
    const createdCommentKeysRef = useRef<Set<string>>(new Set());
    const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(
      null,
    );

    useEffect(() => {
      if (comments.length === 0) return;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
        rafRef.current = null;
      });
    }, [comments.length]);

    const isCommentOrderCreated = useCallback((comment: LiveComment) => {
      return Boolean(
        comment.isOrderCreated ||
        comment.orderId ||
        createdCommentKeysRef.current.has(createOrderCommentKey(comment)),
      );
    }, []);

    const handleCreateOrder = useCallback(
      async (comment: LiveComment) => {
        const commentKey = createOrderCommentKey(comment);

        if (createdCommentKeysRef.current.has(commentKey)) {
          alert("Comment này đã tạo đơn rồi.");
          return { success: false, orderId: "" };
        }

        try {
          createdCommentKeysRef.current.add(commentKey);
          const result = await orderManager.createOrderFromComment(comment);

          Alert.alert(
            "Tạo đơn thành công",
            'Di chuyển sang "Đơn đã tạo" để kiểm tra',
            [
              { text: "Huỷ", style: "cancel" },
              { text: "OK", onPress: () => onNavigateToOrders?.() },
            ],
          );

          return { success: true, orderId: result?.orderId ?? "" };
        } catch (error) {
          createdCommentKeysRef.current.delete(commentKey);

          if (__DEV__) console.error("CREATE ORDER ERROR:", error);
          alert(error instanceof Error ? error.message : "Tạo đơn thất bại");

          return { success: false, orderId: "" };
        }
      },
      [onNavigateToOrders, orderManager],
    );

    const handlePrintOrder = useCallback(
      (comment: LiveComment, orderId: string) => {
        const order = orderManager.orders.find(
          (item) =>
            item.id === orderId ||
            item.id === comment.orderId ||
            item.commentId === comment.id,
        );

        if (!order) {
          Alert.alert(
            "Không tìm thấy đơn",
            "Vui lòng tải lại danh sách đơn hàng.",
          );
          return;
        }

        // Luồng mobile hiện chỉ map comment -> order; native print sẽ được nối ở callback ngoài khi có print module.
        onPrintOrder?.(comment, order.id) ??
          Alert.alert("Đơn đã tạo", "Tính năng in lại sẽ được bổ sung sau.");
      },
      [onPrintOrder, orderManager.orders],
    );

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
      <View style={styles.container}>
        <FlashList
          ref={listRef}
          data={comments}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          inverted
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  },
);

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flex: 1,
    paddingBottom: 48 * 2 - 16,
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
