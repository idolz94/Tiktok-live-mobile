import { Screen } from "@components/screen";
import { ProductSheet } from "@features/orders/components/product-sheet";
import {
  ShippingProvider,
  ShippingProviderSheet,
} from "@features/orders/components/shipping-provider-sheet";
import { useOrderDetail } from "@features/orders/hooks/use-order-detail";
import { formatMoney } from "@features/orders/utils/order";
import { useSpxAccount } from "@features/settings/hooks/use-spx-account";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { createStyles } from "@utils/createStyles";
import {
  cancelShipmentApi,
  refreshShippingStatusApi,
} from "@features/orders/service/create-shipment-api";
import { router, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "@components/linear-gradient";
import { OrderDetailCustomerSection } from "@features/orders/components/order-detail/order-detail-customer-section";
import {
  OrderDetailNoteSection,
} from "@features/orders/components/order-detail/order-detail-info-sections";
import { OrderDetailHeader } from "@features/orders/components/order-detail/order-detail-header";
import { OrderDetailProductsSection } from "@features/orders/components/order-detail/order-detail-products-section";
import { OrderDetailShipBar } from "@features/orders/components/order-detail/order-detail-ship-bar";
import { OrderDetailShippingSection } from "@features/orders/components/order-detail/order-detail-shipping-section";

export const OrderDetail = memo(() => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useOrderDetail(id ?? "");
  const { show, hide } = useBottomSheet();
  const { connected: spxConnected } = useSpxAccount();
  const [selectedProvider, setSelectedProvider] =
    useState<ShippingProvider>("manual");

  useEffect(() => {
    if (spxConnected) setSelectedProvider("spx");
  }, [spxConnected]);
  const [shippingFeeDisplay, setShippingFeeDisplay] = useState("");
  const [prepaidDisplay, setPrepaidDisplay] = useState("");
  const [prepaidAmount, setPrepaidAmount] = useState<number | null>(null);

  const displayName = useMemo(() => {
    const order = detail.order;
    return order?.customerName || order?.username || "Khách live";
  }, [detail.order]);

  const hiddenCount = Math.max(
    detail.products.length - detail.displayProducts.length,
    0,
  );

  const handleChangeShippingFee = useCallback(
    (_amount: number, display: string) => {
      setShippingFeeDisplay(display);
    },
    [],
  );

  const handleChangePrepaid = useCallback((amount: number, display: string) => {
    setPrepaidAmount(amount);
    setPrepaidDisplay(display);
  }, []);

  const localRemain = Math.max(
    0,
    (detail.order?.totalAmount ?? detail.productTotal + detail.shippingFee) -
      (prepaidAmount ?? 0),
  );

  const handleShip = useCallback(() => {
    if (!detail.order) return;

    router.push({
      pathname: "/order-detail/create-shipment",
      params: {
        order: JSON.stringify(detail.order),
        shippingFee: String(
          shippingFeeDisplay
            ? Number(shippingFeeDisplay.replace(/\D/g, ""))
            : detail.shippingFee,
        ),
        provider: selectedProvider,
        prepaid: String(prepaidAmount ?? 0),
      },
    });
  }, [
    detail.order,
    detail.shippingFee,
    selectedProvider,
    shippingFeeDisplay,
    prepaidAmount,
  ]);

  const handleCancelShipment = useCallback(() => {
    const order = detail.order;
    if (!order?.trackingCode) return;

    Alert.alert("Huỷ vận đơn", `Huỷ vận đơn ${order.trackingCode}?`, [
      { text: "Không" },
      {
        text: "Huỷ vận đơn",
        style: "destructive",
        onPress: () => {
          void cancelShipmentApi(order.id, { trackingId: order.trackingCode })
            .then(() => refreshShippingStatusApi(order.id))
            .then(() => detail.fetchOrder())
            .then(() => Alert.alert("Thành công", "Đã huỷ vận đơn."))
            .catch((err) => {
              Alert.alert(
                "Không huỷ được vận đơn",
                err instanceof Error ? err.message : "Vui lòng thử lại.",
              );
            });
        },
      },
    ]);
  }, [detail]);

  const handleSaveNewProduct = useCallback(
    (data: { name: string; price: number; quantity: number }) => {
      hide();
      detail.handleAddProduct({
        productName: data.name,
        price: data.price,
        quantity: data.quantity,
      });
    },
    [detail, hide],
  );

  const handleSaveProductEdit = useCallback(
    (
      itemId: string,
      data: { name: string; price: number; quantity: number },
    ) => {
      if (!itemId) return;
      hide();
      detail.handleUpdateProduct(itemId, {
        productName: data.name,
        price: data.price,
        quantity: data.quantity,
      });
    },
    [detail, hide],
  );

  const handleTikTok = useCallback(() => {
    const username = detail.order?.customerTikTokUsername;
    if (!username) return;
    const tiktokUrl = `https://www.tiktok.com/@${username}`;
    Linking.openURL(tiktokUrl).catch(() => {
      Linking.openURL(`tiktok://user?username=${username}`);
    });
  }, [detail.order?.customerTikTokUsername]);

  return (
    <Screen>
      <View style={styles.container}>
        <LinearGradient
          type="gra_background"
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <OrderDetailHeader onBack={() => router.back()} />

        {detail.loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#FF6B8A" />
          </View>
        ) : null}

        {!detail.loading && detail.error ? (
          <Text style={styles.message}>{detail.error}</Text>
        ) : null}

        {!detail.loading && !detail.error && !detail.order ? (
          <Text style={styles.message}>Không tìm thấy đơn hàng.</Text>
        ) : null}

        {!detail.loading && detail.order ? (
          <>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {detail.order.source !== "manual" ? (
                <OrderDetailCustomerSection
                  order={detail.order}
                  displayName={displayName}
                  customerDefaultAddress={detail.customerDefaultAddress}
                  onTikTok={handleTikTok}
                />
              ) : null}
              <OrderDetailProductsSection
                products={detail.products}
                displayProducts={detail.displayProducts}
                showAllProducts={detail.showAllProducts}
                hiddenCount={hiddenCount}
                totalQuantity={detail.totalQuantity}
                productTotal={detail.productTotal}
                isEditable={detail.order.status === "draft"}
                isProductMutating={
                  detail.addingProduct || detail.updatingProduct
                }
                onAddProduct={() => {
                  show({
                    content: (
                      <ProductSheet
                        mode="add"
                        loading={detail.addingProduct}
                        onClose={hide}
                        onSave={handleSaveNewProduct}
                      />
                    ),
                  });
                }}
                onEditProduct={(product) => {
                  detail.openEditProduct(product);
                  show({
                    content: (
                      <ProductSheet
                        mode="edit"
                        initialName={product.name ?? ""}
                        initialPrice={product.price}
                        initialQty={product.quantity}
                        loading={detail.updatingProduct}
                        onClose={hide}
                        onSave={(data) =>
                          handleSaveProductEdit(product.id, data)
                        }
                      />
                    ),
                  });
                }}
                onDeleteProduct={() => {}}
                onToggleShowAll={detail.toggleShowAllProducts}
              />
              <OrderDetailShippingSection
                order={detail.order}
                selectedProvider={selectedProvider}
                shippingFeeDisplay={
                  shippingFeeDisplay || formatMoney(detail.shippingFee)
                }
                prepaidDisplay={prepaidDisplay || formatMoney(0)}
                remain={localRemain}
                isEditable={detail.order.status === "draft"}
                onOpenProvider={() => {
                  let id: string;
                  const close = () => hide(id);
                  id = show({
                    content: (
                      <ShippingProviderSheet
                        selected={selectedProvider}
                        spxConnected={spxConnected}
                        onClose={close}
                        onSelect={(provider) => {
                          setSelectedProvider(provider);
                          close();
                        }}
                      />
                    ),
                  });
                }}
                onChangeShippingFee={handleChangeShippingFee}
                onChangePrepaid={handleChangePrepaid}
              />
              {detail.order.note ? (
                <OrderDetailNoteSection note={detail.order.note} />
              ) : null}
              <OrderDetailShipBar
                section="actions"
                onShip={handleShip}
                trackingCode={detail.order.trackingCode}
                providerName={detail.order.providerName}
                hasShipment={!!detail.order.trackingCode}
                shippingStatus={detail.order.shippingStatus}
                onCancel={handleCancelShipment}
                onPrint={() => {}}
                onShare={() => {}}
                onConfirm={() => { void detail.handleToggleConfirm(); }}
                isConfirmed={detail.order.status === "confirmed"}
                confirmLoading={detail.confirmLoading}
              />
            </ScrollView>
            <OrderDetailShipBar
              section="bottom"
              onShip={handleShip}
              trackingCode={detail.order.trackingCode}
              providerName={detail.order.providerName}
              hasShipment={!!detail.order.trackingCode}
              shippingStatus={detail.order.shippingStatus}
              onCancel={handleCancelShipment}
              onPrint={() => {}}
              onShare={() => {}}
              onConfirm={() => { void detail.handleToggleConfirm(); }}
              isConfirmed={detail.order.status === "confirmed"}
              confirmLoading={detail.confirmLoading}
            />
          </>
        ) : null}
      </View>
    </Screen>
  );
});

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  scroll: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    padding: 16,
    color: colors.neutral500,
    ...textPresets.fs14_400,
  },
}));
