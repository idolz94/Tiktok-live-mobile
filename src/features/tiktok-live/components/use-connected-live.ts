import { LiveComment } from "@app-types/index";
import { useToast } from "@components/toast";
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { createOrderCommentKey } from "@features/tiktok-live/utils/comment";
import { useCallback, useEffect, useRef } from "react";
import type { ComponentRef } from "react";
import { Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import type { ConnectedLiveProps } from "../types/types";

export function useConnectedLive({ orderManager, onPrintOrder }: ConnectedLiveProps) {
  const { comments, isConnected } = useTikTokLiveSocketContext();
  const showToast = useToast();

  const listRef = useRef<ComponentRef<typeof FlashList<LiveComment>>>(null);
  const createdCommentKeysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  useEffect(() => {
    if (comments.length === 0) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
      rafRef.current = null;
    });
  }, [comments.length]);

  const isCommentOrderCreated = useCallback(
    (comment: LiveComment) =>
      Boolean(
        comment.isOrderCreated ||
        comment.orderId ||
        createdCommentKeysRef.current.has(createOrderCommentKey(comment)),
      ),
    [],
  );

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

        showToast("Tạo đơn thành công", "success");

        return { success: true, orderId: result?.orderId ?? "" };
      } catch (error) {
        createdCommentKeysRef.current.delete(commentKey);
        if (__DEV__) console.error("CREATE ORDER ERROR:", error);
        alert(error instanceof Error ? error.message : "Tạo đơn thất bại");
        return { success: false, orderId: "" };
      }
    },
    [orderManager, showToast],
  );

  const handlePrintOrder = useCallback(
    (comment: LiveComment, orderId: string) => {
      const order = orderManager.orders.find(
        (item) => item.id === orderId || item.id === comment.orderId || item.commentId === comment.id,
      );

      if (!order) {
        Alert.alert("Không tìm thấy đơn", "Vui lòng tải lại danh sách đơn hàng.");
        return;
      }

      onPrintOrder?.(comment, order.id) ??
        Alert.alert("Đơn đã tạo", "Tính năng in lại sẽ được bổ sung sau.");
    },
    [onPrintOrder, orderManager.orders],
  );

  return { comments, isConnected, listRef, isCommentOrderCreated, handleCreateOrder, handlePrintOrder };
}
