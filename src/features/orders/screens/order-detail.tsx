import { Header } from "@components/header";
import { Screen } from "@components/screen";
import { ProductSheet } from "@features/orders/components/product-sheet";
import {
  ShippingProvider,
  ShippingProviderSheet,
} from "@features/orders/components/shipping-provider-sheet";
import { useOrderDetail } from "@features/orders/hooks/use-order-detail";
import { formatMoney } from "@features/orders/utils/order";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { createStyles } from "@utils/createStyles";
import {
  cancelShipmentApi,
  refreshShippingStatusApi,
} from "@features/orders/service/create-shipment-api";
import { router, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  View,
} from "react-native";
import { OrderDetailCustomerSection } from "@features/orders/components/order-detail/order-detail-customer-section";
import { OrderDetailFooterActions } from "@features/orders/components/order-detail/order-detail-footer-actions";
import {
  OrderDetailMetaSection,
  OrderDetailNoteSection,
} from "@features/orders/components/order-detail/order-detail-info-sections";
import { Divider } from "@features/orders/components/order-detail/order-detail-primitives";
import { OrderDetailProductsSection } from "@features/orders/components/order-detail/order-detail-products-section";
import { OrderDetailShipBar } from "@features/orders/components/order-detail/order-detail-ship-bar";
import { OrderDetailShippingSection } from "@features/orders/components/order-detail/order-detail-shipping-section";

export const OrderDetail = memo(() => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useOrderDetail(id ?? "");
  const { show, hide } = useBottomSheet();
  const [selectedProvider, setSelectedProvider] =
    useState<ShippingProvider>("spx");
  const [shippingFeeDisplay, setShippingFeeDisplay] = useState("");
  const [prepaidDisplay, setPrepaidDisplay] = useState("");

  const displayName = useMemo(() => {
    const order = detail.order;
    return order?.customerName || order?.username || "Khách live";
  }, [detail.order]);

  const createdDate = useMemo(() => {
    if (!detail.order?.createdAt) return "";
    return new Date(detail.order.createdAt).toLocaleDateString("vi-VN");
  }, [detail.order?.createdAt]);

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

  const handleChangePrepaid = useCallback(
    (_amount: number, display: string) => {
      setPrepaidDisplay(display);
    },
    [],
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
      },
    });
  }, [detail.order, detail.shippingFee, selectedProvider, shippingFeeDisplay]);

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
      <Header title="Tổng quan đơn hàng" />
      <View style={styles.container}>
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
              <OrderDetailMetaSection
                orderCode={detail.order.orderCode || detail.order.id}
                createdDate={createdDate}
                status={detail.order.status}
              />
              <Divider />
              {detail.order.source !== "manual" ? (
                <>
                  <OrderDetailCustomerSection
                    order={detail.order}
                    displayName={displayName}
                    customerDefaultAddress={detail.customerDefaultAddress}
                    onTikTok={handleTikTok}
                  />
                  <Divider />
                </>
              ) : null}
              <OrderDetailProductsSection
                products={detail.products}
                displayProducts={detail.displayProducts}
                showAllProducts={detail.showAllProducts}
                hiddenCount={hiddenCount}
                totalQuantity={detail.totalQuantity}
                productTotal={detail.productTotal}
                isEditable={detail.order.status === "draft"}
                isProductMutating={detail.addingProduct || detail.updatingProduct}
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
              <Divider />
              <OrderDetailShippingSection
                order={detail.order}
                selectedProvider={selectedProvider}
                shippingFeeDisplay={
                  shippingFeeDisplay || formatMoney(detail.shippingFee)
                }
                prepaidDisplay={prepaidDisplay || formatMoney(0)}
                remain={detail.remain}
                isEditable={detail.order.status === "draft"}
                onOpenProvider={() => {
                  show({
                    content: (
                      <ShippingProviderSheet
                        selected={selectedProvider}
                        onClose={hide}
                        onSelect={(provider) => {
                          setSelectedProvider(provider);
                          hide();
                        }}
                      />
                    ),
                  });
                }}
                onChangeShippingFee={handleChangeShippingFee}
                onChangePrepaid={handleChangePrepaid}
              />
              {detail.order.note ? (
                <>
                  <Divider />
                  <OrderDetailNoteSection note={detail.order.note} />
                </>
              ) : null}
              <Divider />
              <OrderDetailFooterActions
                onPrint={() => {}}
                onShare={() => {}}
                onConfirm={() => {
                  void detail.handleToggleConfirm();
                }}
                isConfirmed={detail.order.status === "confirmed"}
                confirmLoading={detail.confirmLoading}
              />
            </ScrollView>
            <OrderDetailShipBar
              onShip={handleShip}
              trackingCode={detail.order.trackingCode}
              providerName={detail.order.providerName}
              hasShipment={!!detail.order.trackingCode}
              shippingStatus={detail.order.shippingStatus}
              onCancel={handleCancelShipment}
              onPrint={() => {}}
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
    backgroundColor: colors.neutral50,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
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
