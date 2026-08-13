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
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import {
  cancelShipmentApi,
  getShipmentLabelApi,
  refreshShippingStatusApi,
} from "@features/orders/service/create-shipment-api";
import * as WebBrowser from "expo-web-browser";
import { router, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "@components/linear-gradient";
import { OrderDetailCustomerSection } from "@features/orders/components/order-detail/order-detail-customer-section";
import { OrderDetailNoteSection } from "@features/orders/components/order-detail/order-detail-info-sections";
import { Header } from "@components/header";
import { OrderDetailProductsSection } from "@features/orders/components/order-detail/order-detail-products-section";
import { OrderDetailShipBar } from "@features/orders/components/order-detail/order-detail-ship-bar";
import { OrderDetailShippingSection } from "@features/orders/components/order-detail/order-detail-shipping-section";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

function buildOrderShareText(
  order: NonNullable<ReturnType<typeof useOrderDetail>["order"]>,
) {
  const lines = [
    `Đơn hàng: ${order.orderCode}`,
    `Khách: ${order.customerName || order.username || "Khách live"}`,
  ];

  if (order.customerPhone) lines.push(`SĐT: ${order.customerPhone}`);
  if (order.customerAddress) lines.push(`Địa chỉ: ${order.customerAddress}`);

  lines.push(
    "Sản phẩm:",
    ...(order.products.length
      ? order.products.map((item) => {
          const name = [item.name, item.color, item.size]
            .filter(Boolean)
            .join(" - ");
          return `- ${name || "Sản phẩm"} x${item.quantity}: ${formatMoney((item.totalAmount ?? 0) > 0 ? item.totalAmount! : item.price * item.quantity)}`;
        })
      : [
          `- ${order.productName || "Sản phẩm"} x${order.quantity}: ${formatMoney(order.price * order.quantity)}`,
        ]),
    `Tổng tiền: ${formatMoney(order.totalAmount ?? 0)}`,
    `Phí vận chuyển: ${formatMoney(order.shippingFee ?? 0)}`,
    `Cần thu: ${formatMoney(order.codAmount ?? 0)}`,
  );

  if (order.note) lines.push(`Ghi chú: ${order.note}`);
  return lines.join("\n");
}

export const OrderDetail = memo(() => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useOrderDetail(id ?? "");
  const { show, hide, replace } = useBottomSheet();
  const toast = useToast();
  const { colors } = useThemes();
  const { connected: spxConnected, submitting, connect } = useSpxAccount();
  const [selectedProvider, setSelectedProvider] =
    useState<ShippingProvider>("manual");

  useEffect(() => {
    if (spxConnected) setSelectedProvider("spx");
  }, [spxConnected]);
  const [shippingFeeDisplay, setShippingFeeDisplay] = useState("");
  const [shippingFeeAmount, setShippingFeeAmount] = useState<number | null>(
    null,
  );
  const [prepaidDisplay, setPrepaidDisplay] = useState("");
  const [prepaidAmount, setPrepaidAmount] = useState<number | null>(null);

  const displayName =
    detail.order?.customerName || detail.order?.username || "Khách hàng";

  const hiddenCount = Math.max(
    detail.products.length - detail.displayProducts.length,
    0,
  );

  const handleChangeShippingFee = useCallback(
    (amount: number, display: string) => {
      setShippingFeeAmount(amount);
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
    detail.productTotal +
      (shippingFeeAmount ?? detail.shippingFee) -
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
    shippingFeeAmount,
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
            .then(() =>
              toast.success({
                title: "Thành công",
                description: "Đã huỷ vận đơn.",
              }),
            )
            .catch((err) => {
              toast.error({
                title: "Không huỷ được vận đơn",
                description:
                  err instanceof Error
                    ? err.message
                    : "SPX từ chối huỷ vận đơn. Vui lòng thử lại.",
              });
            });
        },
      },
    ]);
  }, [detail]);

  const [printing, setPrinting] = useState(false);

  const handlePrintLabel = useCallback(async () => {
    const order = detail.order;
    if (!order?.id || printing) return;
    if (!order.trackingCode) {
      toast.error({
        title: "Chưa thể in",
        description: "Đơn hàng chưa có vận đơn.",
      });
      return;
    }
    setPrinting(true);
    try {
      const res = await getShipmentLabelApi(order.id);
      if (res.labelUrl) await WebBrowser.openBrowserAsync(res.labelUrl);
    } catch (err) {
      toast.error({
        title: "Không lấy được nhãn vận đơn",
        description:
          err instanceof Error ? err.message : "Vui lòng thử lại.",
      });
    } finally {
      setPrinting(false);
    }
  }, [detail.order, printing, toast]);

  const handleSaveNewProduct = useCallback(
    (data: {
      name: string;
      color: string;
      price: number;
      quantity: number;
    }) => {
      hide();
      detail.handleAddProduct({
        productName: data.name,
        color: data.color,
        price: data.price,
        quantity: data.quantity,
      });
    },
    [detail, hide],
  );

  const handleSaveProductEdit = useCallback(
    (
      itemId: string,
      data: {
        name: string;
        color: string;
        price: number;
        quantity: number;
        nameDirty: boolean;
        colorDirty: boolean;
        priceDirty: boolean;
        quantityDirty: boolean;
      },
    ) => {
      if (!itemId) return;
      hide();
      // ponytail: luôn gửi productName + productCode để heal DB rows có null/empty
      // dùng data.name nếu user sửa, fallback sang giá trị hiện tại trong state (không phải "Sản phẩm")
      const currentProduct = detail.products.find((p) => p.id === itemId);
      const resolvedName = data.nameDirty
        ? data.name
        : currentProduct?.name && currentProduct.name !== "Sản phẩm"
          ? currentProduct.name
          : data.name;
      const resolvedCode = currentProduct?.code || undefined;
      detail.handleUpdateProduct(itemId, {
        productName: resolvedName,
        ...(resolvedCode ? { productCode: resolvedCode } : {}),
        ...(data.colorDirty ? { color: data.color } : {}),
        ...(data.priceDirty ? { price: data.price } : {}),
        ...(data.quantityDirty ? { quantity: data.quantity } : {}),
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

  const handleShare = useCallback(() => {
    if (!detail.order) return;
    void Share.share({ message: buildOrderShareText(detail.order) });
  }, [detail.order]);

  const handleOpenProvider = useCallback(() => {
    let sheetId: string;
    const closeSheet = () => hide(sheetId);

    const showProviderSheet = () => {
      replace(
        {
          content: (
            <ShippingProviderSheet
              selected={selectedProvider}
              spxConnected={spxConnected}
              onClose={closeSheet}
              onSelect={(provider) => {
                setSelectedProvider(provider);
                closeSheet();
              }}
              onConnectSpx={showConnectSheet}
            />
          ),
        },
        sheetId,
      );
    };

    const showConnectSheet = () => {
      replace(
        {
          content: (
            <SpxConnectSheet
              submitting={submitting}
              onSubmit={async (data) => {
                const ok = await connect(data);
                if (ok) {
                  showProviderSheet();
                  toast.success("Đã kết nối tài khoản SPX");
                } else {
                  toast.error({
                    title: "Lỗi",
                    description:
                      "Không thể kết nối tài khoản SPX. Vui lòng thử lại.",
                  });
                }
              }}
              onClose={showProviderSheet}
            />
          ),
          enablePanDownToClose: false,
        },
        sheetId,
      );
    };

    sheetId = show({ content: null });
    showProviderSheet();
  }, [
    connect,
    hide,
    replace,
    selectedProvider,
    show,
    spxConnected,
    submitting,
    toast,
  ]);

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
          <ActivityIndicator size="large" color={colors.primary} />
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
          <KeyboardAwareScrollView
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
                detail.addingProduct ||
                detail.updatingProduct ||
                detail.deletingProduct
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
                      initialColor={product.color ?? ""}
                      initialPrice={product.price}
                      initialQty={product.quantity}
                      loading={detail.updatingProduct}
                      onClose={hide}
                      onSave={(data) => handleSaveProductEdit(product.id, data)}
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
              onOpenProvider={handleOpenProvider}
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
              onPrint={() => void handlePrintLabel()}
              onShare={handleShare}
              onDeposit={() => {
                void detail.handleToggleDeposit();
              }}
              isPaid={detail.isPaid}
              depositLoading={detail.depositLoading}
            />
          </KeyboardAwareScrollView>
          <OrderDetailShipBar
            section="bottom"
            onShip={handleShip}
            trackingCode={detail.order.trackingCode}
            providerName={detail.order.providerName}
            hasShipment={!!detail.order.trackingCode}
            shippingStatus={detail.order.shippingStatus}
            onCancel={handleCancelShipment}
            onPrint={() => {}}
            onShare={handleShare}
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
