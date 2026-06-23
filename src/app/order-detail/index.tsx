import { useLocalSearchParams, router, type Href } from "expo-router";
import {
  addOrderItemApi,
  deleteOrderItemApi,
  getOrderByIdApi,
  updateOrderDepositStatusApi,
  updateOrderItemApi,
  updateOrderStatusApi,
} from "@features/orders/service/api";
import { ProductSheet } from "@features/orders/components/product-sheet";
import {
  ShippingProviderSheet,
  type ShippingProvider,
} from "@features/orders/components/shipping-provider-sheet";
import { OrderProduct, OrderWithTikTok } from "@app-types/index";
import { getOrderTotal } from "@features/orders/utils/order";
import { getOrderTikTokUsername, openTikTokProfile } from "@utils/tiktok";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Divider } from "./components/OrderDetailPrimitives";
import { OrderDetailHeader } from "./components/OrderDetailHeader";
import { OrderDetailMetaSection, OrderDetailNoteSection } from "./components/OrderDetailInfoSections";
import { OrderDetailCustomerSection } from "./components/OrderDetailCustomerSection";
import { OrderDetailProductsSection } from "./components/OrderDetailProductsSection";
import { OrderDetailShippingSection } from "./components/OrderDetailShippingSection";
import { OrderDetailFooterActions } from "./components/OrderDetailFooterActions";
import { OrderDetailShipBar } from "./components/OrderDetailShipBar";
import { useEffect, useMemo, useState, useCallback } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatOrderDate(value?: string | Date | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("vi-VN");
}

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemes();

  const [order, setOrder] = useState<OrderWithTikTok | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositLoading, setDepositLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [shippingFeeInput, setShippingFeeInput] = useState(0);
  const [prepaidAmountInput, setPrepaidAmountInput] = useState(0);
  const [productSheetMode, setProductSheetMode] = useState<"add" | "edit" | null>(null);
  const [editingProduct, setEditingProduct] = useState<OrderProduct | null>(null);
  const [itemLoading, setItemLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ShippingProvider>("manual");
  const [shippingDrawerOpen, setShippingDrawerOpen] = useState(false);
  const [shippingFeeDisplay, setShippingFeeDisplay] = useState("");
  const [prepaidDisplay, setPrepaidDisplay] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getOrderByIdApi(id)
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
        const fee = Number(data.shippingFee || 0);
        const prepaid = Number(data.codAmount || 0);
        setShippingFeeInput(fee);
        setPrepaidAmountInput(prepaid);
        setShippingFeeDisplay(fee > 0 ? fee.toLocaleString("vi-VN") : "");
        setPrepaidDisplay(prepaid > 0 ? prepaid.toLocaleString("vi-VN") : "");
      })
      .catch(() => {
        if (!cancelled) {
          Alert.alert("Không tìm thấy đơn hàng.", "", [
            { text: "Quay lại", onPress: () => router.canGoBack() && router.back() },
          ]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, []);

  const handleTikTok = useCallback(() => {
    if (!order) return;
    openTikTokProfile(getOrderTikTokUsername(order));
  }, [order]);

  const handleToggleDeposit = useCallback(async () => {
    if (!order || depositLoading) return;
    const isPaid = order.depositStatus === "paid" || order.depositStatus === "deposited";
    const nextStatus = isPaid ? "unpaid" : "paid";
    setDepositLoading(true);
    try {
      await updateOrderDepositStatusApi({ orderId: order.id, depositStatus: nextStatus });
      setOrder((prev) => prev ? { ...prev, depositStatus: nextStatus } : prev);
    } catch {
      Alert.alert("Cập nhật thất bại", "Không thể cập nhật trạng thái cọc.");
    } finally {
      setDepositLoading(false);
    }
  }, [order, depositLoading]);

  const handleConfirmOrder = useCallback(async () => {
    if (!order || confirmLoading) return;
    const nextStatus = order.status === "confirmed" ? "draft" : "confirmed";
    setConfirmLoading(true);
    try {
      await updateOrderStatusApi({ orderId: order.id, status: nextStatus });
      setOrder((prev) => (prev ? { ...prev, status: nextStatus } : prev));
    } catch {
      Alert.alert("Cập nhật thất bại", "Không thể cập nhật trạng thái đơn.");
    } finally {
      setConfirmLoading(false);
    }
  }, [order, confirmLoading]);

  const closeProductSheet = useCallback(() => {
    setProductSheetMode(null);
    setEditingProduct(null);
  }, []);

  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    setProductSheetMode("add");
  }, []);

  const handleEditProduct = useCallback((product: OrderProduct) => {
    setEditingProduct(product);
    setProductSheetMode("edit");
  }, []);

  const handleAddItem = useCallback(
    async (data: { code: string; name: string; price: number; quantity: number }) => {
      if (!order) return;
      setItemLoading(true);
      try {
        const item = await addOrderItemApi(order.id, {
          productCode: data.code,
          productName: data.name,
          price: data.price,
          quantity: data.quantity,
        });
        const newProduct: OrderProduct = {
          id: String(item?.id ?? Date.now()),
          code: data.code,
          name: data.name,
          price: data.price,
          quantity: data.quantity,
          totalAmount: data.price * data.quantity,
        };
        setOrder((prev) =>
          prev ? { ...prev, products: [...prev.products, newProduct] } : prev,
        );
        closeProductSheet();
      } catch {
        Alert.alert("Thêm thất bại", "Không thể thêm sản phẩm.");
      } finally {
        setItemLoading(false);
      }
    },
    [order, closeProductSheet],
  );

  const handleUpdateItem = useCallback(
    async (data: { code: string; name: string; price: number; quantity: number }) => {
      if (!order || !editingProduct) return;
      setItemLoading(true);
      try {
        await updateOrderItemApi(order.id, editingProduct.id, {
          price: data.price,
          quantity: data.quantity,
        });
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                products: prev.products.map((p) =>
                  p.id === editingProduct.id
                    ? { ...p, price: data.price, quantity: data.quantity, totalAmount: data.price * data.quantity }
                    : p,
                ),
              }
            : prev,
        );
        closeProductSheet();
      } catch {
        Alert.alert("Cập nhật thất bại", "Không thể sửa sản phẩm.");
      } finally {
        setItemLoading(false);
      }
    },
    [order, editingProduct, closeProductSheet],
  );

  const handleDeleteItem = useCallback(
    (product: OrderProduct) => {
      if (!order) return;
      Alert.alert(
        "Xoá sản phẩm",
        `Xoá "${product.name}" khỏi đơn hàng?`,
        [
          { text: "Huỷ", style: "cancel" },
          {
            text: "Xoá",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteOrderItemApi(order.id, product.id);
                setOrder((prev) =>
                  prev
                    ? { ...prev, products: prev.products.filter((p) => p.id !== product.id) }
                    : prev,
                );
              } catch {
                Alert.alert("Xoá thất bại", "Không thể xoá sản phẩm.");
              }
            },
          },
        ],
      );
    },
    [order],
  );

  const handleShare = useCallback(() => {
    Alert.alert("Chưa hỗ trợ", "Chia sẻ hóa đơn sẽ được bổ sung sau.");
  }, []);

  const handleShip = useCallback(() => {
    if (!order) return;
    const dest: Href = {
      pathname: "/order-detail/create-shipment",
      params: {
        order: JSON.stringify(order),
        shippingFee: String(shippingFeeInput),
        provider: selectedProvider,
      },
    };
    router.push(dest);
  }, [order, shippingFeeInput, selectedProvider]);

  const products = useMemo(() => order?.products ?? [], [order]);
  const productTotal = useMemo(() => getOrderTotal(products), [products]);
  const totalQuantity = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.quantity || 0), 0),
    [products],
  );
  const displayProducts = showAllProducts ? products : products.slice(0, 3);
  const remain = order?.totalAmount ?? Math.max(0, productTotal + shippingFeeInput - prepaidAmountInput);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) return null;

  const displayName = order.customerName || order.username || "Khách live";
  const createdDate = formatOrderDate(order.createdAt);
  const orderCode = order.orderCode || order.id;
  const isDeposited = order.depositStatus === "paid" || order.depositStatus === "deposited";
  const isConfirmed = order.status === "confirmed";
  const hiddenProducts = Math.max(0, products.length - displayProducts.length);

  return (
    <SafeAreaView style={styles.safeArea}>
      <OrderDetailHeader onBack={handleBack} onPrint={() => {}} onMore={handleShare} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <OrderDetailMetaSection
          orderCode={orderCode}
          createdDate={createdDate}
          status={order.status}
        />

        <Divider />

        <OrderDetailCustomerSection
          order={order}
          displayName={displayName}
          onTikTok={handleTikTok}
        />

        <Divider />

        <OrderDetailProductsSection
          products={products}
          displayProducts={displayProducts}
          showAllProducts={showAllProducts}
          hiddenCount={hiddenProducts}
          totalQuantity={totalQuantity}
          productTotal={productTotal}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteItem}
          onToggleShowAll={() => setShowAllProducts((prev) => !prev)}
        />

        <Divider />

        <OrderDetailShippingSection
          order={order}
          selectedProvider={selectedProvider}
          shippingFeeDisplay={shippingFeeDisplay}
          prepaidDisplay={prepaidDisplay}
          remain={remain}
          onOpenProvider={() => setShippingDrawerOpen(true)}
          onChangeShippingFee={(amount, display) => {
            setShippingFeeInput(amount);
            setShippingFeeDisplay(display);
          }}
          onChangePrepaid={(amount, display) => {
            setPrepaidAmountInput(amount);
            setPrepaidDisplay(display);
          }}
        />

        {order.note ? (
          <>
            <Divider />
            <OrderDetailNoteSection note={order.note} />
          </>
        ) : null}

        <Divider />

        <OrderDetailFooterActions
          isDeposited={isDeposited}
          isConfirmed={isConfirmed}
          depositLoading={depositLoading}
          confirmLoading={confirmLoading}
          onPrint={() => {}}
          onDepositOrConfirm={isDeposited ? handleConfirmOrder : handleToggleDeposit}
          onShare={handleShare}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <OrderDetailShipBar onShip={handleShip} />

      <ProductSheet
        visible={productSheetMode !== null}
        mode={productSheetMode ?? "add"}
        initialPrice={productSheetMode === "edit" && editingProduct ? editingProduct.price : 0}
        initialQty={productSheetMode === "edit" ? editingProduct?.quantity ?? 1 : 1}
        loading={itemLoading}
        onClose={closeProductSheet}
        onSave={productSheetMode === "edit" ? handleUpdateItem : handleAddItem}
      />

      <ShippingProviderSheet
        visible={shippingDrawerOpen}
        selected={selectedProvider}
        onClose={() => setShippingDrawerOpen(false)}
        onSelect={(p) => setSelectedProvider(p)}
      />
    </SafeAreaView>
  );
}

const styles = createStyles(({ colors }) => ({
  safeArea: { flex: 1, backgroundColor: colors.neutral50 },
  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  scrollContent: { backgroundColor: colors.neutral50 },
  bottomSpacer: { height: 96 },
}));
