import { ProductSheet } from "@features/orders/components/product-sheet";
import {
  ShippingProvider,
  ShippingProviderSheet,
} from "@features/orders/components/shipping-provider-sheet";
import { SpxConnectSheet } from "@features/settings/components/spx-connect-sheet";
import { useOrderDetail } from "@features/orders/hooks/use-order-detail";
import { formatMoney } from "@features/orders/utils/order";
import { useSpxAccount } from "@features/settings/hooks/use-spx-account";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { useToast } from "@components/toast";
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
import { Header } from "@components/header";
import { OrderDetailProductsSection } from "@features/orders/components/order-detail/order-detail-products-section";
import { OrderDetailShipBar } from "@features/orders/components/order-detail/order-detail-ship-bar";
import { OrderDetailShippingSection } from "@features/orders/components/order-detail/order-detail-shipping-section";

export const OrderDetail = memo(() => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useOrderDetail(id ?? "");
  const { show, hide } = useBottomSheet();
  const toast = useToast();
  const { connected: spxConnected, submitting, connect } = useSpxAccount();
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
      data: { name: string; price: number; quantity: number; nameDirty: boolean; priceDirty: boolean },
    ) => {
      if (!itemId) return;
      hide();
      detail.handleUpdateProduct(itemId, {
        ...(data.nameDirty ? { productName: data.name } : {}),
        ...(data.priceDirty ? { price: data.price } : {}),
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
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Header title="Tổng quan đơn hàng" transparent />

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
                  detail.addingProduct || detail.updatingProduct || detail.deletingProduct
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
                onDeleteProduct={(product) => {
                  Alert.alert(
                    "Xoá sản phẩm",
                    `Xoá "${product.name || product.code || "sản phẩm"}" khỏi đơn?`,
                    [
                      { text: "Huỷ", style: "cancel" },
                      {
                        text: "Xoá",
                        style: "destructive",
                        onPress: () => detail.handleDeleteProduct(product.id),
                      },
                    ],
                  );
                }}
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
                        onConnectSpx={() => {
                          let sheetId: string;
                          const closeConnectSheet = () => hide(sheetId);
                          sheetId = show({
                            content: (
                              <SpxConnectSheet
                                submitting={submitting}
                                onSubmit={async (data) => {
                                  const ok = await connect(data);
                                  if (ok) {
                                    closeConnectSheet();
                                    toast.success("Đã kết nối tài khoản SPX");
                                  } else {
                                    Alert.alert("Lỗi", "Không thể kết nối tài khoản SPX. Vui lòng thử lại.");
                                  }
                                }}
                                onClose={closeConnectSheet}
                              />
                            ),
                            enablePanDownToClose: false,
                          });
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
                onDeposit={() => { void detail.handleToggleDeposit(); }}
                isPaid={detail.isPaid}
                depositLoading={detail.depositLoading}
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
            />
          </>
        ) : null}
    </View>
  );
});

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
  scroll: {
    flex: 1,
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
