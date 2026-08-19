import { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { Avatar } from "@components/avatar";
import { Button } from "@components/button";
import { Icon } from "@components/icon";
import { Separator } from "@components/separator";
import { createStyles } from "@utils/createStyles";
import { formatMoneyFull, getOrderTotal } from "@features/orders/utils/order";
import type { MergeGroup } from "../../utils/merge-groups";

type Props = {
  group: MergeGroup;
  selectedIds: Set<string>;
  targetId: string | null;
  activeGroupId: string | null;
  merging: boolean;
  canMerge: boolean;
  onToggleSelect: (groupId: string, orderId: string) => void;
  onSetTarget: (groupId: string, orderId: string) => void;
  onMerge: (groupId: string) => void;
  onClearSelection: (groupId: string) => void;
};

function shortCode(order: { orderCode: string; id: string }) {
  const raw = order.orderCode ? order.orderCode.slice(-6) : order.id.slice(-6);
  return raw.padStart(6, "0");
}

export const MergeGroupCard = memo(
  ({
    group,
    selectedIds,
    targetId,
    activeGroupId,
    merging,
    canMerge,
    onToggleSelect,
    onSetTarget,
    onMerge,
    onClearSelection,
  }: Props) => {
    const isDimmed = Boolean(activeGroupId && activeGroupId !== group.id);
    const selectedCount = selectedIds.size;

    const handleMerge = useCallback(() => {
      onMerge(group.id);
    }, [group.id, onMerge]);

    const handleClear = useCallback(() => {
      onClearSelection(group.id);
    }, [group.id, onClearSelection]);

    return (
      <View style={[styles.card, isDimmed && styles.dimmed]}>
        <View style={styles.header}>
          <Avatar uri={group.avatar} username={group.customerName} size={40} />
          <View style={styles.headerMeta}>
            <Text style={styles.customerName} numberOfLines={1}>
              {group.customerName}
            </Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {group.orders.length} đơn · {group.totalItems} SP ·{" "}
              {formatMoneyFull(group.totalAmount)}
              {group.tiktokUsername ? ` · ${group.tiktokUsername}` : ""}
            </Text>
          </View>
          {selectedCount > 0 && (
            <Pressable
              hitSlop={8}
              onPress={handleClear}
              style={styles.clearBtn}
            >
              <Icon name="close" size={16} tintColor="neutral500" />
            </Pressable>
          )}
        </View>

        <Separator type="horizontal" size={1} style={{ marginVertical: 12 }} />

        <View style={styles.orders}>
          {group.orders.map((order) => {
            const checked = selectedIds.has(order.id);
            const isTarget = targetId === order.id;
            const total = Number(
              order.totalAmount ||
                order.subtotalAmount ||
                getOrderTotal(order.products),
            );

            return (
              <Pressable
                key={order.id}
                onPress={() => onToggleSelect(group.id, order.id)}
                onLongPress={() => {
                  if (checked) onSetTarget(group.id, order.id);
                }}
                style={[
                  styles.orderRow,
                  checked && styles.orderRowChecked,
                  isDimmed && styles.orderRowDimmed,
                ]}
                disabled={isDimmed}
              >
                <View
                  style={[
                    styles.checkbox,
                    checked && styles.checkboxActive,
                    isTarget && styles.checkboxTarget,
                  ]}
                >
                  {checked && <Icon name="check" size={12} tintColor="white" />}
                </View>

                <View style={styles.orderBody}>
                  <View style={styles.orderTop}>
                    <Text style={styles.orderCode} numberOfLines={1}>
                      #{shortCode(order)}
                    </Text>
                    {isTarget && (
                      <View style={styles.targetBadge}>
                        <Text style={styles.targetBadgeText}>Giữ lại</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.orderMeta} numberOfLines={1}>
                    {order.products.length} SP · {formatMoneyFull(total)} ·{" "}
                    {order.products[0]?.name || order.comment || "Đơn nháp"}
                  </Text>
                </View>

                <Text style={styles.orderPrice}>{formatMoneyFull(total)}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.hint}>
            {selectedCount === 0
              ? "Chọn ít nhất 2 đơn để gộp"
              : selectedCount === 1
                ? "Chọn thêm 1 đơn nữa"
                : `${selectedCount} đơn đã chọn${targetId ? " · nhấn giữ để đổi đơn giữ lại" : ""}`}
          </Text>
          <Button
            title={
              selectedCount >= 2
                ? `Gộp ${selectedCount} đơn → 1`
                : `Gộp ${group.orders.length} đơn → 1`
            }
            gradientType="gra_primary"
            loading={merging}
            disabled={!canMerge || merging || isDimmed}
            onPress={handleMerge}
            containerStyle={styles.cta}
          />
        </View>
      </View>
    );
  },
);

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  card: {
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 16,
    ...shadows.sd2,
  },
  dimmed: {
    opacity: 0.45,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  },
  headerMeta: {
    flex: 1,
  },
  customerName: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  headerSub: {
    marginTop: 2,
    color: colors.neutral500,
    ...textPresets.fs12_400,
  },
  clearBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
  },
  orders: {
    rowGap: 8,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border10,
    backgroundColor: colors.white,
  },
  orderRowChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  orderRowDimmed: {
    opacity: 0.6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border10,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxTarget: {
    borderColor: colors.primary,
  },
  orderBody: {
    flex: 1,
  },
  orderTop: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
  },
  orderCode: {
    color: colors.neutral900,
    ...textPresets.fs12_500,
  },
  targetBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
    backgroundColor: colors.successLight,
  },
  targetBadgeText: {
    color: colors.success,
    ...textPresets.fs11_400,
  },
  orderMeta: {
    marginTop: 2,
    color: colors.neutral500,
    ...textPresets.fs12_400,
  },
  orderPrice: {
    color: colors.neutral900,
    ...textPresets.fs12_500,
  },
  footer: {
    marginTop: 12,
    rowGap: 8,
  },
  hint: {
    color: colors.neutral500,
    ...textPresets.fs12_400,
  },
  cta: {
    borderRadius: 999,
    overflow: "hidden",
  },
}));
