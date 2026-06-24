import { Header } from "@components/header";
import { Screen } from "@components/screen";
import { ProductSheet } from "@features/orders/components/product-sheet";
import {
  ShippingProvider,
  ShippingProviderSheet,
} from "@features/orders/components/shipping-provider-sheet";
import { useOrderDetail } from "@features/orders/hooks/use-order-detail";
import { formatMoney } from "@features/orders/utils/order";
import { createStyles } from "@utils/createStyles";
import { router, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import { OrderDetailCustomerSection } from "../../../app/order-detail/components/OrderDetailCustomerSection";
import { OrderDetailFooterActions } from "../../../app/order-detail/components/OrderDetailFooterActions";
import {
  OrderDetailMetaSection,
  OrderDetailNoteSection,
} from "../../../app/order-detail/components/OrderDetailInfoSections";
import { Divider } from "../../../app/order-detail/components/OrderDetailPrimitives";
import { OrderDetailProductsSection } from "../../../app/order-detail/components/OrderDetailProductsSection";
import { OrderDetailShipBar } from "../../../app/order-detail/components/OrderDetailShipBar";
import { OrderDetailShippingSection } from "../../../app/order-detail/components/OrderDetailShippingSection";

export const OrderDetail = memo(() => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useOrderDetail(id ?? "");
  const [selectedProvider, setSelectedProvider] = useState<ShippingProvider>("manual");
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

  const hiddenCount = Math.max(detail.products.length - detail.displayProducts.length, 0);

  const handleChangeShippingFee = useCallback((_amount: number, display: string) => {
    setShippingFeeDisplay(display);
  }, []);

  const handleChangePrepaid = useCallback((_amount: number, display: string) => {
    setPrepaidDisplay(display);
  }, []);

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

  const handleSaveNewProduct = useCallback(
    (data: { name: string; price: number; quantity: number }) => {
      void detail.handleAddProduct({
        name: data.name,
        price: data.price,
        quantity: data.quantity,
      });
    },
    [detail],
  );

  const handleSaveProductEdit = useCallback(
    (data: { name: string; price: number; quantity: number }) => {
      if (!detail.selectedProduct) return;
      void detail.handleUpdateProduct(detail.selectedProduct.id, {
        name: data.name,
        price: data.price,
        quantity: data.quantity,
      });
    },
    [detail],
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
          <Text style={styles.message}>Đang tải đơn hàng...</Text>
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
                onAddProduct={detail.openAddProduct}
                onEditProduct={detail.openEditProduct}
                onDeleteProduct={() => {}}
                onToggleShowAll={detail.toggleShowAllProducts}
              />
              <Divider />
              <OrderDetailShippingSection
                order={detail.order}
                selectedProvider={selectedProvider}
                shippingFeeDisplay={shippingFeeDisplay || formatMoney(detail.shippingFee)}
                prepaidDisplay={prepaidDisplay || formatMoney(detail.codAmount)}
                remain={detail.remain}
                onOpenProvider={detail.openShipping}
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
                isDeposited={detail.isPaid}
                isConfirmed={detail.order.status === "confirmed"}
                depositLoading={detail.depositLoading}
                confirmLoading={detail.confirmLoading}
                onPrint={() => {}}
                onDepositOrConfirm={
                  detail.isPaid ? detail.handleToggleConfirm : detail.handleToggleDeposit
                }
                onShare={() => {}}
              />
            </ScrollView>
            <OrderDetailShipBar onShip={handleShip} />
            <ProductSheet
              visible={detail.addProductOpen}
              mode="add"
              loading={detail.addingProduct}
              onClose={detail.closeAddProduct}
              onSave={handleSaveNewProduct}
            />
            <ProductSheet
              visible={detail.editProductOpen}
              mode="edit"
              initialCode={detail.selectedProduct?.code}
              initialName={detail.selectedProduct?.name}
              initialPrice={detail.selectedProduct?.price}
              initialQty={detail.selectedProduct?.quantity}
              loading={detail.updatingProduct}
              onClose={detail.closeEditProduct}
              onSave={handleSaveProductEdit}
            />
            <ShippingProviderSheet
              visible={detail.showShippingScreen}
              selected={selectedProvider}
              onClose={detail.closeShipping}
              onSelect={setSelectedProvider}
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
  message: {
    padding: 16,
    color: colors.neutral500,
    ...textPresets.fs14_400,
  },
}));
