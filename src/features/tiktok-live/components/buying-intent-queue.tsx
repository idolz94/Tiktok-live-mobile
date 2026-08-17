import { FlashList } from "@shopify/flash-list";
import { memo, useCallback } from "react";
import { Text, View } from "react-native";
import { createStyles } from "@utils/createStyles";
import { Button } from "@components/button";
import { useBuyingIntentQueue } from "../hooks/use-buying-intent-queue";
import type { BuyingIntentQueueItem, BuyingIntentQueueStatus } from "../types/types";
import type { CreateOrderFromCommentResult } from "@features/orders/service/api";

const statusLabel: Record<BuyingIntentQueueStatus, string> = {
  pending: "Đang chờ",
  handled: "Đã xử lý",
  ignored: "Bỏ qua",
};

const intentLabel: Record<string, string> = {
  buy: "Mua",
  ask_price: "Hỏi giá",
  ask_stock: "Hỏi tồn",
  ask_shipping: "Hỏi ship",
  ask_product: "Hỏi sản phẩm",
  ask_how_to_buy: "Cách mua",
};

const fieldLabel: Record<string, string> = {
  product: "Mã",
  quantity: "SL",
  size: "Size",
  color: "Màu",
};

function QueueRow({
  item,
  onUpdateStatus,
  onCreateDraftOrder,
}: {
  item: BuyingIntentQueueItem;
  onUpdateStatus: (item: BuyingIntentQueueItem, status: BuyingIntentQueueStatus) => void;
  onCreateDraftOrder: (item: BuyingIntentQueueItem) => Promise<CreateOrderFromCommentResult>;
}) {
  const handleHandled = useCallback(() => {
    onUpdateStatus(item, "handled");
  }, [item, onUpdateStatus]);

  const handleIgnored = useCallback(() => {
    onUpdateStatus(item, "ignored");
  }, [item, onUpdateStatus]);

  const handleCreateDraft = useCallback(() => {
    onCreateDraftOrder(item);
  }, [item, onCreateDraftOrder]);

  const parsed = item.parsedData;
  const missing = item.missingFields ?? [];
  const suggested = item.suggestedReply;
  const canDraft = item.canCreateDraftOrder;

  return (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <View style={styles.identity}>
          <Text style={styles.name} numberOfLines={1}>
            {item.displayName || item.tiktokUsername}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            @{item.tiktokUsername}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{statusLabel[item.status]}</Text>
        </View>
      </View>

      <Text style={styles.comment} numberOfLines={3}>
        {item.latestCommentText || "—"}
      </Text>

      {parsed && (parsed.productCode || parsed.quantity || parsed.size || parsed.color) && (
        <View style={styles.chipRow}>
          {parsed.productCode && (
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Mã</Text>
              <Text style={styles.chipValue}>{parsed.productCode}</Text>
            </View>
          )}
          {parsed.quantity && (
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>SL</Text>
              <Text style={styles.chipValue}>{parsed.quantity}</Text>
            </View>
          )}
          {parsed.size && (
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Size</Text>
              <Text style={styles.chipValue}>{parsed.size}</Text>
            </View>
          )}
          {parsed.color && (
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Màu</Text>
              <Text style={styles.chipValue}>{parsed.color}</Text>
            </View>
          )}
        </View>
      )}

      {missing.length > 0 && (
        <View style={styles.chipRow}>
          {missing.map((field) => (
            <View key={field} style={styles.chipMissing}>
              <Text style={styles.chipMissingText}>Thiếu {fieldLabel[field] || field}</Text>
            </View>
          ))}
        </View>
      )}

      {suggested && (
        <View style={styles.suggestedBlock}>
          <Text style={styles.suggestedLabel}>Gợi ý phản hồi:</Text>
          <Text style={styles.suggestedText}>{suggested}</Text>
        </View>
      )}

      <View style={styles.rowMeta}>
        <Text style={styles.intent}>{intentLabel[item.intent] ?? item.intent}</Text>
        <Text style={styles.meta}>
          {item.commentCount ?? 0} comment
          {(item.commentCount ?? 0) === 1 ? "" : "s"}
        </Text>
      </View>

      <View style={styles.actions}>
        {canDraft && (
          <Button
            title="Tạo đơn nháp"
            type="gradient"
            onPress={handleCreateDraft}
            containerStyle={styles.actionButton}
          />
        )}
        <Button
          title="Đã xử lý"
          type="soft"
          onPress={handleHandled}
          containerStyle={styles.actionButton}
        />
        <Button
          title="Bỏ qua"
          type="outline"
          onPress={handleIgnored}
          containerStyle={styles.actionButton}
        />
      </View>
    </View>
  );
}

export const BuyingIntentQueue = memo(() => {
  const { queueItems, handleUpdateStatus, handleCreateDraftOrder } = useBuyingIntentQueue();

  const keyExtractor = useCallback((item: BuyingIntentQueueItem) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: BuyingIntentQueueItem }) => (
      <QueueRow
        item={item}
        onUpdateStatus={handleUpdateStatus}
        onCreateDraftOrder={handleCreateDraftOrder}
      />
    ),
    [handleUpdateStatus, handleCreateDraftOrder],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        Khách có dấu hiệu mua hàng sẽ tự động vào đây. Bấm Tạo đơn nháp khi đủ thông tin, Đã xử lý khi đã phản hồi, Bỏ qua nếu không cần.
      </Text>

      {queueItems.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có khách nào cần xử lý.</Text>
      ) : (
        <FlashList
          data={queueItems}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
});

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flex: 1,
  },
  hint: {
    color: colors.neutral500,
    ...textPresets.fs12_400,
    lineHeight: 18,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  emptyText: {
    color: colors.neutral500,
    ...textPresets.fs14_500,
    paddingHorizontal: 16,
    paddingTop: 24,
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  separator: {
    height: 10,
  },
  card: {
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 12,
    gap: 10,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  identity: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  meta: {
    color: colors.neutral500,
    ...textPresets.fs12_400,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.primary,
    ...textPresets.fs12_500,
  },
  comment: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
    lineHeight: 18,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  intent: {
    color: colors.neutral500,
    ...textPresets.fs12_500,
    textTransform: "capitalize",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: colors.neutral100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  chipLabel: {
    color: colors.neutral500,
    ...textPresets.fs12_400,
  },
  chipValue: {
    color: colors.neutral900,
    ...textPresets.fs12_500,
  },
  chipMissing: {
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipMissingText: {
    color: "#DC2626",
    ...textPresets.fs12_500,
  },
  suggestedBlock: {
    borderRadius: 8,
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  suggestedLabel: {
    color: "#9A3412",
    ...textPresets.fs11_400,
  },
  suggestedText: {
    color: "#9A3412",
    ...textPresets.fs12_400,
    lineHeight: 17,
  },
}));
