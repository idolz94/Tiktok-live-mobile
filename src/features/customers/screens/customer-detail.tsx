import { Header } from "@components/header";
import { LinearGradient } from "@components/linear-gradient";
import { getOrderStatusLabel } from "@features/customers/components/order-status-label";
import { useCustomerDetail } from "@features/customers/hooks/use-customer-detail";
import type {
  CustomerAddress,
  CustomerOrderItem,
} from "@features/customers/types/customer-detail";
import { formatMoney } from "@features/orders/utils/order";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { router } from "expo-router";
import { memo } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

const OrderRow = memo(
  ({
    order,
    onPress,
  }: {
    order: CustomerOrderItem;
    onPress: (id: string) => void;
  }) => (
    <Pressable style={styles.orderRow} onPress={() => onPress(order.id)}>
      <View style={styles.orderRowTop}>
        <Text numberOfLines={1} style={styles.orderCode}>
          {order.orderCode || order.id}
        </Text>
        <Text style={styles.orderStatus}>{getOrderStatusLabel(order.status)}</Text>
      </View>
      <View style={styles.orderRowBottom}>
        <Text style={styles.orderAmount}>{formatMoney(order.totalAmount)}</Text>
        {!!order.codAmount && order.codAmount > 0 && (
          <Text style={styles.orderCod}>COD: {formatMoney(order.codAmount)}</Text>
        )}
      </View>
    </Pressable>
  ),
);

const AddressRow = memo(
  ({
    address,
    onSelect,
  }: {
    address: CustomerAddress;
    onSelect: (address: CustomerAddress) => void;
  }) => {
    const locationLine = [address.address, address.ward, address.district, address.province]
      .filter(Boolean)
      .join(", ");

    return (
      <Pressable style={styles.addressRow} onPress={() => onSelect(address)}>
        <View style={styles.addressHeader}>
          <Text numberOfLines={1} style={styles.addressName}>
            {address.label || address.name || "Địa chỉ"}
          </Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Mặc định</Text>
            </View>
          )}
        </View>
        {!!address.name && !!address.label && (
          <Text style={styles.addressLine}>{address.name}</Text>
        )}
        {!!address.phone && <Text style={styles.addressLine}>{address.phone}</Text>}
        {!!locationLine && <Text style={styles.addressLine}>{locationLine}</Text>}
      </Pressable>
    );
  },
);

export function CustomerDetailScreen({ id }: { id: string }) {
  const { shadows } = useThemes();
  const {
    customer,
    isLoading,
    error,
    refetch,
    orders,
    isLoadingOrders,
    ordersError,
    addresses,
    isLoadingAddresses,
    handleSelectAddress,
  } = useCustomerDetail(id);

  const handlePressOrder = (orderId: string) =>
    router.push({ pathname: "/order-detail", params: { id: orderId } });

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Header
        title={customer?.displayName || "Khách hàng"}
        showBack
        transparent
      />

      {isLoading ? (
        <View style={styles.statusBox}>
          <ActivityIndicator color="#FF6B8A" />
          <Text style={styles.statusText}>Đang tải thông tin khách hàng...</Text>
        </View>
      ) : error || !customer ? (
        <View style={styles.statusBox}>
          <Text style={styles.errorText}>
            {error || "Không tìm thấy khách hàng."}
          </Text>
          <Pressable style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Tải lại</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, shadows.sd2]}>
            <Text style={styles.name}>
              {customer.displayName || customer.tiktokUsername || "Khách hàng"}
            </Text>
            {!!customer.phone && (
              <Text style={styles.infoLine}>SĐT: {customer.phone}</Text>
            )}
            {!!customer.tiktokUsername && (
              <Text style={styles.infoLine}>TikTok: @{customer.tiktokUsername}</Text>
            )}
          </View>

          <View style={[styles.card, shadows.sd2]}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Tổng đơn</Text>
              <Text style={styles.statValue}>{customer.totalOrders}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Tổng chi tiêu</Text>
              <Text style={styles.statValue}>{formatMoney(customer.totalSpent)}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Đơn hàng</Text>
          {isLoadingOrders ? (
            <View style={styles.sectionStatus}>
              <ActivityIndicator color="#FF6B8A" />
            </View>
          ) : ordersError ? (
            <Text style={styles.errorText}>{ordersError}</Text>
          ) : orders.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có đơn hàng.</Text>
          ) : (
            <View style={[styles.card, shadows.sd2]}>
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} onPress={handlePressOrder} />
              ))}
            </View>
          )}

          <Text style={styles.sectionTitle}>Địa chỉ</Text>
          {isLoadingAddresses ? (
            <View style={styles.sectionStatus}>
              <ActivityIndicator color="#FF6B8A" />
            </View>
          ) : addresses.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có địa chỉ.</Text>
          ) : (
            <View style={[styles.card, shadows.sd2]}>
              {addresses.map((address) => (
                <AddressRow
                  key={address.id}
                  address={address}
                  onSelect={handleSelectAddress}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  root: {
    flex: 1,
  },
  bg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statusBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  statusText: {
    marginTop: 12,
    color: colors.textMuted,
    ...textPresets.fs15_800,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
    ...textPresets.fs15_800,
  },
  retryButton: {
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.white,
    ...textPresets.fs14_800,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 34,
    rowGap: 12,
  },
  card: {
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 16,
  },
  name: {
    color: colors.neutral900,
    ...textPresets.fs18_900,
  },
  infoLine: {
    marginTop: 6,
    color: colors.textDarkGray,
    ...textPresets.fs14_800,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  statLabel: {
    color: colors.textMuted,
    ...textPresets.fs14_800,
  },
  statValue: {
    color: colors.neutral900,
    ...textPresets.fs15_900,
  },
  sectionTitle: {
    marginTop: 4,
    color: colors.neutral900,
    ...textPresets.fs15_900,
  },
  sectionStatus: {
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyText: {
    color: colors.textMuted,
    ...textPresets.fs14_800,
  },
  orderRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  orderRowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 8,
  },
  orderCode: {
    flex: 1,
    color: colors.textDarkGray,
    ...textPresets.fs15_800,
  },
  orderStatus: {
    color: colors.textMuted,
    ...textPresets.fs12_400,
  },
  orderRowBottom: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderAmount: {
    color: colors.neutral900,
    ...textPresets.fs14_800,
  },
  orderCod: {
    color: colors.textMuted,
    ...textPresets.fs12_400,
  },
  addressRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 8,
  },
  addressName: {
    flex: 1,
    color: colors.textDarkGray,
    ...textPresets.fs15_800,
  },
  defaultBadge: {
    borderRadius: 999,
    backgroundColor: colors.neutral50,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  defaultBadgeText: {
    color: colors.textMuted,
    ...textPresets.fs11_800,
  },
  addressLine: {
    marginTop: 4,
    color: colors.textMuted,
    ...textPresets.fs12_400,
  },
}));
