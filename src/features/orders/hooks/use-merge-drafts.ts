import { useCallback, useMemo, useReducer, useRef, useState } from "react";
import { ApiError } from "@utils/http/api-error";
import { useCustomerRefreshStore } from "@features/customers/stores/customer-refresh-store";
import type { OrderWithTikTok } from "@app-types/index";
import type { MergeGroup, MergeGroupsResult } from "../utils/merge-groups";
import { mergeDraftOrdersApi } from "../service/api";
import { mergeDraftsSchema } from "../schemas/merge-drafts.schema";

type UseMergeDraftsParams = {
  groups: MergeGroupsResult;
  setOrders: React.Dispatch<React.SetStateAction<OrderWithTikTok[]>>;
  reloadOrders: () => Promise<void>;
  onSuccessMessage?: (title: string) => void;
  onErrorMessage?: (title: string) => void;
};

function getMergeErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const code = String(error.data?.code || "").toUpperCase();
    if (error.status === 404) return "Một số đơn đã không tồn tại. Đang tải lại.";
    if (code === "VALIDATION_ERROR") return "Thông tin gộp đơn không hợp lệ.";
    if (code === "BAD_REQUEST" || error.status === 400) {
      return String(error.data?.message || error.message || "Không thể gộp các đơn đã chọn.");
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return "Gộp đơn thất bại. Vui lòng thử lại.";
}

type MergeSelectionState = {
  activeGroupId: string | null;
  selectedByGroup: Record<string, string[]>;
  targetByGroup: Record<string, string>;
};

type MergeSelectionAction =
  | { type: "toggle"; groupId: string; orderId: string }
  | { type: "setTarget"; groupId: string; orderId: string }
  | { type: "clear"; groupId: string }
  | { type: "clearAll" };

function mergeSelectionReducer(
  state: MergeSelectionState,
  action: MergeSelectionAction,
): MergeSelectionState {
  switch (action.type) {
    case "toggle": {
      const { groupId, orderId } = action;
      if (state.activeGroupId && state.activeGroupId !== groupId) return state;
      const cur = state.selectedByGroup[groupId] ?? [];
      const isSelected = cur.includes(orderId);
      const nextArr = isSelected
        ? cur.filter((id) => id !== orderId)
        : [...cur, orderId];

      const nextSelected: Record<string, string[]> = { ...state.selectedByGroup };
      if (nextArr.length === 0) delete nextSelected[groupId];
      else nextSelected[groupId] = nextArr;

      const nextTarget: Record<string, string> = { ...state.targetByGroup };
      let nextActive: string | null = state.activeGroupId;

      if (nextArr.length === 0) {
        delete nextTarget[groupId];
        if (nextActive === groupId) nextActive = null;
      } else {
        if (!nextActive) nextActive = groupId;
        const curTarget = state.targetByGroup[groupId];
        if (!curTarget) {
          nextTarget[groupId] = isSelected ? nextArr[0] : orderId;
          if (cur.length === 0) nextTarget[groupId] = orderId;
        } else if (isSelected && curTarget === orderId) {
          nextTarget[groupId] = nextArr[0];
        }
      }

      return {
        activeGroupId: nextActive,
        selectedByGroup: nextSelected,
        targetByGroup: nextTarget,
      };
    }
    case "setTarget": {
      const { groupId, orderId } = action;
      const ids = state.selectedByGroup[groupId] ?? [];
      if (!ids.includes(orderId)) return state;
      return {
        ...state,
        targetByGroup: { ...state.targetByGroup, [groupId]: orderId },
      };
    }
    case "clear": {
      const { groupId } = action;
      const nextSelected = { ...state.selectedByGroup };
      const nextTarget = { ...state.targetByGroup };
      delete nextSelected[groupId];
      delete nextTarget[groupId];
      return {
        activeGroupId: state.activeGroupId === groupId ? null : state.activeGroupId,
        selectedByGroup: nextSelected,
        targetByGroup: nextTarget,
      };
    }
    case "clearAll":
      return { activeGroupId: null, selectedByGroup: {}, targetByGroup: {} };
    default:
      return state;
  }
}

export function useMergeDrafts({
  groups,
  setOrders,
  reloadOrders,
  onSuccessMessage,
  onErrorMessage,
}: UseMergeDraftsParams) {
  const [mergingGroupId, setMergingGroupId] = useState<string | null>(null);
  const mergingRef = useRef(false);

  const [selection, dispatch] = useReducer(mergeSelectionReducer, {
    activeGroupId: null,
    selectedByGroup: {},
    targetByGroup: {},
  });

  const { activeGroupId, selectedByGroup, targetByGroup } = selection;

  const groupMap = useMemo(() => {
    const all = [...groups.mergeable, ...groups.unmergeable];
    return new Map<string, MergeGroup>(all.map((group) => [group.id, group]));
  }, [groups.mergeable, groups.unmergeable]);

  const toggleSelect = useCallback(
    (groupId: string, orderId: string) => {
      if (mergingGroupId) return;
      dispatch({ type: "toggle", groupId, orderId });
    },
    [mergingGroupId],
  );

  const setTarget = useCallback(
    (groupId: string, orderId: string) => {
      if (mergingGroupId) return;
      dispatch({ type: "setTarget", groupId, orderId });
    },
    [mergingGroupId],
  );

  const clearSelection = useCallback((groupId: string) => {
    dispatch({ type: "clear", groupId });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: "clearAll" });
  }, []);

  const canMergeGroup = useCallback(
    (groupId: string) => (selectedByGroup[groupId]?.length ?? 0) >= 2,
    [selectedByGroup],
  );

  const confirmAndMerge = useCallback(
    async (groupId: string) => {
      if (mergingRef.current) return;
      const group = groupMap.get(groupId);
      const selectedIds = selectedByGroup[groupId] ?? [];
      const targetId = targetByGroup[groupId];

      if (!group || !group.canMerge || selectedIds.length < 2 || !targetId) {
        onErrorMessage?.("Chọn ít nhất 2 đơn trong cùng nhóm để gộp.");
        return;
      }

      const sourceIds = selectedIds.filter((id) => id !== targetId);
      const dedupedSourceIds = Array.from(new Set(sourceIds));

      if (dedupedSourceIds.length === 0) {
        onErrorMessage?.("Đơn nguồn không được chứa đơn đích.");
        return;
      }

      const isDevPreviewMerge =
        __DEV__ &&
        (String(targetId).startsWith("dev-") ||
          dedupedSourceIds.some((id) => String(id).startsWith("dev-")));

      if (!isDevPreviewMerge) {
        const parsed = mergeDraftsSchema.safeParse({
          targetOrderId: targetId,
          sourceOrderIds: dedupedSourceIds,
        });

        if (!parsed.success) {
          onErrorMessage?.(
            parsed.error.issues[0]?.message || "Thông tin gộp đơn không hợp lệ.",
          );
          return;
        }
      }

      mergingRef.current = true;
      setMergingGroupId(groupId);

      try {
        if (isDevPreviewMerge) {
          await new Promise<void>((resolve) => setTimeout(resolve, 500));
          const deleted = new Set(dedupedSourceIds);
          setOrders((prev) => {
            const target = prev.find((order) => order.id === targetId);
            if (!target) return prev;
            const sources = prev.filter((order) => deleted.has(order.id));
            const mergedProducts = [
              ...(Array.isArray(target.products) ? target.products : []),
              ...sources.flatMap((order) => (Array.isArray(order.products) ? order.products : [])),
            ];
            const mergedTotal =
              Number(target.totalAmount ?? target.subtotalAmount ?? 0) +
              sources.reduce((sum, order) => sum + Number(order.totalAmount ?? order.subtotalAmount ?? 0), 0);
            const mergedOrder = {
              ...target,
              products: mergedProducts,
              totalAmount: mergedTotal,
              subtotalAmount: mergedTotal,
              codAmount: mergedTotal,
            } as OrderWithTikTok;
            const kept = prev.filter(
              (order) => !deleted.has(order.id) && order.id !== targetId,
            );
            return [mergedOrder, ...kept];
          });
          dispatch({ type: "clear", groupId });
          onSuccessMessage?.("Gộp đơn (DEV preview) thành công.");
          return;
        }

        const result = await mergeDraftOrdersApi({
          targetOrderId: targetId,
          sourceOrderIds: dedupedSourceIds,
        });

        const deleted = new Set(result.deletedOrderIds);

        setOrders((prev) => {
          const kept = prev.filter(
            (order) => !deleted.has(order.id) && order.id !== result.targetOrderId,
          );
          return [result.order, ...kept];
        });

        useCustomerRefreshStore.getState().invalidate();
        dispatch({ type: "clear", groupId });
        onSuccessMessage?.("Gộp đơn thành công.");
      } catch (error) {
        const message = getMergeErrorMessage(error);
        onErrorMessage?.(message);
        if (error instanceof ApiError && error.status === 404) {
          await reloadOrders();
        }
        if (__DEV__) console.error("MERGE DRAFTS ERROR:", error);
      } finally {
        mergingRef.current = false;
        setMergingGroupId(null);
      }
    },
    [
      groupMap,
      onErrorMessage,
      onSuccessMessage,
      reloadOrders,
      selectedByGroup,
      setOrders,
      targetByGroup,
    ],
  );

  const selectedIdsFor = useCallback(
    (groupId: string) => new Set(selectedByGroup[groupId] ?? []),
    [selectedByGroup],
  );

  return {
    activeGroupId,
    mergingGroupId,
    selectedByGroup,
    targetByGroup,
    toggleSelect,
    setTarget,
    clearSelection,
    clearAll,
    canMergeGroup,
    confirmAndMerge,
    selectedIdsFor,
  };
}
