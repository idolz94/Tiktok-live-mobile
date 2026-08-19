import { memo, useCallback } from "react";
import { Text, View } from "react-native";
import { Button } from "@components/button";
import { createStyles } from "@utils/createStyles";
import { formatMoneyFull } from "@features/orders/utils/order";
import type { MergeGroup } from "../../utils/merge-groups";

type MergeConfirmSheetProps = {
  group: MergeGroup;
  selectedIds: Set<string>;
  targetId: string | null;
  merging: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const MergeConfirmSheet = memo(
  ({
    group,
    selectedIds,
    targetId,
    merging,
    onClose,
    onConfirm,
  }: MergeConfirmSheetProps) => {
    const selected = group.orders.filter((order) => selectedIds.has(order.id));
    const totalAmount = selected.reduce(
      (sum, order) =>
        sum + Number(order.totalAmount || order.subtotalAmount || 0),
      0,
    );

    const handleConfirm = useCallback(() => {
      onConfirm();
    }, [onConfirm]);

    const codes = selected.map((order) => {
      const raw = order.orderCode
        ? order.orderCode.slice(-6)
        : order.id.slice(-6);
      return `#${raw.padStart(6, "0")}${order.id === targetId ? " (giữ lại)" : ""}`;
    });

    return (
      <View style={styles.root}>
        <Text style={styles.title}>
          Gộp {selected.length} đơn của {group.customerName} thành 1?
        </Text>
        <Text style={styles.sub}>
          Đơn sau gộp sẽ giữ thông tin đơn được đánh dấu “Giữ lại”. Các đơn còn
          lại sẽ bị xóa.
        </Text>

        <View style={styles.summary}>
          <Text style={styles.summaryLine}>• {codes.join(" + ")}</Text>
          <Text style={styles.summaryLine}>
            •{" "}
            {selected.reduce(
              (c, order) => c + Math.max(order.products.length, 1),
              0,
            )}{" "}
            sản phẩm
            {totalAmount ? ` · ${formatMoneyFull(totalAmount)}` : ""}
          </Text>
          <Text style={styles.warning}>Không thể hoàn tác sau khi gộp.</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Huỷ"
            type="outline"
            onPress={onClose}
            disabled={merging}
            containerStyle={styles.actionBtn}
          />
          <Button
            title="Xác nhận gộp"
            gradientType="gra_primary"
            loading={merging}
            onPress={handleConfirm}
            containerStyle={styles.actionBtn}
          />
        </View>
      </View>
    );
  },
);

const styles = createStyles(({ colors, textPresets }) => ({
  root: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
    rowGap: 12,
  },
  title: {
    color: colors.neutral900,
    ...textPresets.fs16_500,
  },
  sub: {
    color: colors.neutral500,
    ...textPresets.fs12_400,
  },
  summary: {
    rowGap: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.neutral50,
  },
  summaryLine: {
    color: colors.neutral900,
    ...textPresets.fs12_500,
  },
  warning: {
    marginTop: 2,
    color: colors.error,
    ...textPresets.fs12_400,
  },
  actions: {
    flexDirection: "row",
    columnGap: 12,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 999,
    overflow: "hidden",
  },
}));
