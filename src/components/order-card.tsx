import { Avatar } from "@components/Avatar";
import { ProductTable } from "@components/product-table";
import { Order, OrderProduct } from "@types";
import { createStyles } from "@utils/createStyles";
import {
  createProductFromComment,
  formatMoneyFromK,
  getOrderTotal,
} from "@utils/order";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

function createDisplayCode(orderCode: string) {
  const numbers = orderCode.replace(/\D/g, "");
  return `#${(numbers || orderCode).slice(-6).padStart(6, "0")}`;
}

export const OrderCard = ({
  item,
  onUpdate,
  onDelete,
  onAddProduct,
  onToggleDeposit,
  onConfirmOrder,
  onOpenOverview,
}: {
  item: Order;
  onUpdate: (id: string, field: keyof Order, value: string) => void;
  onDelete: (id: string) => void;
  onAddProduct?: (orderId: string, product: OrderProduct) => void;
  onToggleDeposit?: (orderId: string) => void;
  onConfirmOrder?: (orderId: string) => void;
  onOpenOverview?: (orderId: string) => void;
}) => {
  const total = getOrderTotal(item.products || []);
  const isPaid = item.depositStatus === "paid";
  const isConfirmed = item.status === "confirmed";

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Avatar uri={item.avatar} username={item.username} size={56} />
        <View style={styles.info}>
          <Text style={styles.code}>{createDisplayCode(item.orderCode)}</Text>
          <Text style={styles.name}>{item.username || "Unknown user"}</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.vip}>VIP</Text>
            <Text style={styles.smallBadge}>☎</Text>
            <Text style={styles.smallBadge}>⌖</Text>
          </View>
        </View>
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={[
              styles.status,
              isConfirmed ? styles.confirmed : styles.draft,
            ]}
            onPress={() => onConfirmOrder?.(item.id)}
          >
            <Text style={styles.statusText}>
              {isConfirmed ? "Đã chốt" : "Đơn nháp"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onDelete(item.id)}
          >
            <Text>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.comment}>{item.comment}</Text>
      <Text style={styles.time}>
        {new Date(item.createdAt).toLocaleTimeString("vi-VN")}
      </Text>

      <View style={styles.totalRow}>
        <Text style={styles.muted}>Tạm tính</Text>
        <Text style={styles.total}>{formatMoneyFromK(total)}</Text>
      </View>

      <ProductTable
        products={item.products || []}
        onAddProduct={
          onAddProduct
            ? () =>
                onAddProduct(item.id, createProductFromComment(item.comment))
            : undefined
        }
      />

      <Text style={styles.label}>Tên đơn / sản phẩm</Text>
      <TextInput
        style={styles.input}
        value={item.productName}
        onChangeText={(value) => onUpdate(item.id, "productName", value)}
        placeholder="Tên sản phẩm"
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.depositButton,
            isPaid ? styles.paidButton : styles.unpaidButton,
          ]}
          onPress={() => onToggleDeposit?.(item.id)}
        >
          <Text style={styles.depositText}>
            {isPaid ? "ĐÃ CỌC" : "CHƯA CỌC"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.overviewButton}
          onPress={() => onOpenOverview?.(item.id)}
        >
          <Text style={styles.overviewText}>TỔNG ĐƠN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  card: {
    marginBottom: 10,
    padding: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 6,
    borderBottomColor: colors.surfaceAlt,
  },
  topRow: { flexDirection: "row", alignItems: "flex-start" },
  info: { flex: 1, marginLeft: 12 },
  code: { color: colors.link, ...textPresets.fs18_900 },
  name: {
    marginTop: 4,
    color: colors.text,
    ...textPresets.fs19_900,
    lineHeight: 24,
  },
  badgeRow: { marginTop: 8, flexDirection: "row", alignItems: "center" },
  vip: {
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: colors.warning,
    color: colors.white,
    ...textPresets.fs19_900,
  },
  smallBadge: {
    marginRight: 4,
    minWidth: 30,
    textAlign: "center",
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 7,
    paddingVertical: 4,
    color: colors.muted,
  },
  rightActions: { alignItems: "flex-end" },
  status: { borderRadius: 7, paddingHorizontal: 10, paddingVertical: 6 },
  confirmed: { backgroundColor: colors.successActive },
  draft: { backgroundColor: colors.warningLight },
  statusText: { color: colors.white, ...textPresets.fs19_900 },
  iconButton: {
    marginTop: 8,
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderGray,
    alignItems: "center",
    justifyContent: "center",
  },
  comment: {
    marginTop: 16,
    color: colors.textMuted,
    ...textPresets.fs16_600,
    lineHeight: 23,
  },
  time: { marginTop: 4, color: colors.textMuted, ...textPresets.fs12_italic },
  totalRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  muted: { color: colors.textMuted, ...textPresets.fs12_italic },
  total: { color: colors.text, ...textPresets.fs17_900 },
  label: {
    marginTop: 14,
    marginBottom: 6,
    color: colors.textDarkGray,
    ...textPresets.fs12_800,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderGray,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: colors.textDark,
  },
  buttonRow: { marginTop: 14, flexDirection: "row" },
  depositButton: {
    minHeight: 48,
    flex: 1,
    marginRight: 10,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  paidButton: {
    borderColor: colors.successActive,
    backgroundColor: colors.successPastel,
  },
  unpaidButton: {
    borderColor: colors.successLight,
    backgroundColor: colors.successBg,
  },
  depositText: {
    color: colors.textDark,
    ...textPresets.fs12_800,
  },
  overviewButton: {
    minHeight: 48,
    flex: 1,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warning,
  },
  overviewText: {
    color: colors.white,
    ...textPresets.fs12_800,
  },
}));
