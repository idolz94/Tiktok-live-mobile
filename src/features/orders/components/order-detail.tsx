import { Header } from "@components/header";
import { Screen } from "@components/screen";
import { useOrderDetail } from "@features/orders/hooks/use-order-detail";
import { createStyles } from "@utils/createStyles";
import { useLocalSearchParams } from "expo-router";
import { memo } from "react";
import { Text, View } from "react-native";

export const OrderDetail = memo(() => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useOrderDetail(id ?? "");

  return (
    <Screen>
      <Header title="Thông tin đơn hàng" />
      <View style={styles.container}>
        {detail.loading ? (
          <Text style={styles.message}>Đang tải đơn hàng...</Text>
        ) : null}

        {!detail.loading && detail.error ? (
          <Text style={styles.message}>{detail.error}</Text>
        ) : null}

        {!detail.loading && !detail.error && !detail.order ? (
          <Text style={styles.message}>Không tìm thấy đơn hàng.</Text>
        ) : null}

        {!detail.loading && detail.order ? (
          <View style={styles.logicPlaceholder}>
            <Text style={styles.message}>Logic OrderDetail đã sẵn sàng.</Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
});

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flex: 1,
    backgroundColor: colors.neutral100,
    padding: 16,
  },
  logicPlaceholder: {
    flex: 1,
  },
  message: {
    color: colors.neutral500,
    ...textPresets.fs14_400,
  },
}));
