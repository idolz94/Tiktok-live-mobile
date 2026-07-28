import { LiveComment } from "@app-types/index";
import { useToast } from "@components/toast";
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { createOrderCommentKey } from "@features/tiktok-live/utils/comment";
import { useCallback, useEffect, useRef } from "react";
import type { ComponentRef } from "react";
import { FlashList } from "@shopify/flash-list";
import type { ConnectedLiveProps } from "../types/types";

export function useConnectedLive({ orderManager, onPrintOrder }: ConnectedLiveProps) {
  const { comments, isConnected } = useTikTokLiveSocketContext();
  const showToast = useToast();

  const listRef = useRef<ComponentRef<typeof FlashList<LiveComment>>>(null);
  // ponytail: Map commentKey → orderId để có thể cleanup khi order bị xoá
  const createdCommentKeysRef = useRef<Map<string, string>>(new Map());
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  useEffect(() => {
    if (comments.length === 0) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
      rafRef.current = null;
    });
  }, [comments.length]);

  // Khi orders list thay đổi, remove comment keys của các order đã bị xoá
  const { orders } = orderManager;
  useEffect(() => {
    const orderIds = new Set(orders.map((o) => o.id));
    for (const [key, orderId] of createdCommentKeysRef.current) {
      if (!orderIds.has(orderId)) {
        createdCommentKeysRef.current.delete(key);
      }
    }
  }, [orders]);

  const isCommentOrderCreated = useCallback(
    (comment: LiveComment) =>
      Boolean(
        comment.isOrderCreated ||
        comment.orderId ||
        createdCommentKeysRef.current.has(createOrderCommentKey(comment)),
      ),
    // ponytail: orders dep → new ref sau mỗi lần orders thay đổi (xoá/thêm) → CommentCardItem re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders],
  );

  const handleCreateOrder = useCallback(
    async (comment: LiveComment) => {
      const commentKey = createOrderCommentKey(comment);

      if (createdCommentKeysRef.current.has(commentKey)) {
        alert("Comment này đã tạo đơn rồi.");
        return { success: false, orderId: "" };
      }

      try {
        createdCommentKeysRef.current.set(commentKey, "pending");
        const result = await orderManager.createOrderFromComment(comment);

        if (result?.orderId) {
          createdCommentKeysRef.current.set(commentKey, result.orderId);
        }

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
        showToast.warning({ title: "Không tìm thấy đơn", description: "Vui lòng tải lại danh sách đơn hàng." });
        return;
      }

      onPrintOrder?.(comment, order.id) ??
        showToast.info({ title: "Đơn đã tạo", description: "Tính năng in lại sẽ được bổ sung sau." });
    },
    [onPrintOrder, orderManager.orders],
  );

  return { comments, isConnected, listRef, isCommentOrderCreated, handleCreateOrder, handlePrintOrder };
}
