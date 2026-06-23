import type { OrderProduct, OrderStatus, OrderWithTikTok } from "@app-types/index";
import type { OrderItemPayload, UpdateOrderItemPayload } from "@features/orders/types/order";
import { getOrderTotal } from "@features/orders/utils/order";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addOrderItemApi,
  getOrderByIdApi,
  updateOrderDepositStatusApi,
  updateOrderItemApi,
  updateOrderStatusApi,
} from "../service/api";

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<OrderWithTikTok | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showShippingScreen, setShowShippingScreen] = useState(false);

  // START: Lưu selectedProductId thay vì object để tránh stale reference khi order update
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  // END: Lưu selectedProductId thay vì object

  const [addingProduct, setAddingProduct] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // START: Race condition guard — bỏ qua response của request cũ nếu có request mới hơn
  const requestRef = useRef(0);
  // END: Race condition guard

  // START: Fetch order khi màn mở, luôn lấy data mới nhất từ server
  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setOrder(null);
      setError("Không tìm thấy mã đơn hàng.");
      setLoading(false);
      return;
    }

    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);

    try {
      const result = await getOrderByIdApi(orderId);
      if (requestId !== requestRef.current) return;
      setOrder(result);
      if (!result) setError("Không tìm thấy đơn hàng.");
    } catch (err) {
      if (requestId !== requestRef.current) return;
      setError(err instanceof Error ? err.message : "Không tải được đơn hàng.");
      setOrder(null);
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);
  // END: Fetch order khi màn mở, luôn lấy data mới nhất từ server

  const products = order?.products ?? [];

  // START: Tách summary riêng để không tính lại khi showAllProducts đổi
  const summary = useMemo(() => {
    const p = order?.products ?? [];
    const productTotal = getOrderTotal(p);
    const totalQuantity = p.reduce((sum, item) => sum + item.quantity, 0);
    const shippingFee = Number(order?.shippingFee ?? 0);
    const codAmount = Number(order?.codAmount ?? 0);
    const remain =
      order?.totalAmount ?? Math.max(0, productTotal + shippingFee - codAmount);

    return { productTotal, totalQuantity, shippingFee, codAmount, remain };
  }, [
    order?.products,
    order?.shippingFee,
    order?.codAmount,
    order?.totalAmount,
  ]);
  // END: Tách summary riêng để không tính lại khi showAllProducts đổi

  // START: Tách displayProducts riêng để không trigger lại summary khi toggle
  const displayProducts = useMemo(
    () => (showAllProducts ? products : products.slice(0, 3)),
    [products, showAllProducts],
  );
  // END: Tách displayProducts riêng

  // Không memo — phép so sánh đơn giản
  const isPaid =
    order?.depositStatus === "paid" || order?.depositStatus === "deposited";

  // START: Derive selectedProduct từ id để tránh stale object khi order update
  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );
  // END: Derive selectedProduct từ id

  const openAddProduct = useCallback(() => setAddProductOpen(true), []);
  const closeAddProduct = useCallback(() => setAddProductOpen(false), []);

  const openEditProduct = useCallback((product: OrderProduct) => {
    setSelectedProductId(product.id);
    setEditProductOpen(true);
  }, []);

  const closeEditProduct = useCallback(() => {
    setEditProductOpen(false);
    setSelectedProductId(null);
  }, []);

  const toggleShowAllProducts = useCallback(
    () => setShowAllProducts((v) => !v),
    [],
  );

  const openShipping = useCallback(() => setShowShippingScreen(true), []);
  const closeShipping = useCallback(() => setShowShippingScreen(false), []);

  // dep chỉ vào orderId thay vì object order để tránh recreate callback
  const orderId_ = order?.id;

  // START: Thêm sản phẩm vào đơn
  const handleAddProduct = useCallback(
    async (payload: OrderItemPayload) => {
      if (!orderId_ || addingProduct) return;

      setAddingProduct(true);
      try {
        const updatedOrder = await addOrderItemApi(orderId_, payload);
        setOrder(updatedOrder);
        setAddProductOpen(false);
      } finally {
        setAddingProduct(false);
      }
    },
    [addingProduct, orderId_],
  );
  // END: Thêm sản phẩm vào đơn

  // START: Cập nhật sản phẩm trong đơn
  const handleUpdateProduct = useCallback(
    async (itemId: string, payload: UpdateOrderItemPayload) => {
      if (!orderId_ || updatingProduct) return;

      setUpdatingProduct(true);
      try {
        const updatedOrder = await updateOrderItemApi(orderId_, itemId, payload);
        setOrder(updatedOrder);
        setEditProductOpen(false);
        setSelectedProductId(null);
      } finally {
        setUpdatingProduct(false);
      }
    },
    [orderId_, updatingProduct],
  );
  // END: Cập nhật sản phẩm trong đơn

  // START: Toggle cọc/chưa cọc — optimistic update, rollback nếu API lỗi
  const depositStatus = order?.depositStatus;

  const handleToggleDeposit = useCallback(async () => {
    if (!orderId_ || depositLoading) return;

    const previousStatus = depositStatus;
    const nextStatus = isPaid ? "unpaid" : "paid";

    setDepositLoading(true);
    setOrder((current) =>
      current ? { ...current, depositStatus: nextStatus } : current,
    );

    try {
      const updatedOrder = await updateOrderDepositStatusApi({
        orderId: orderId_,
        depositStatus: nextStatus,
      });
      setOrder(updatedOrder);
    } catch (err) {
      setOrder((current) =>
        current && previousStatus
          ? { ...current, depositStatus: previousStatus }
          : current,
      );
      throw err;
    } finally {
      setDepositLoading(false);
    }
  }, [depositLoading, depositStatus, isPaid, orderId_]);
  // END: Toggle cọc/chưa cọc optimistic, rollback nếu API lỗi

  // START: Toggle trạng thái đơn giữa confirmed và draft
  const orderStatus = order?.status;

  const handleToggleConfirm = useCallback(async () => {
    if (!orderId_ || confirmLoading) return;

    const nextStatus: OrderStatus =
      orderStatus === "confirmed" ? "draft" : "confirmed";

    setConfirmLoading(true);
    try {
      await updateOrderStatusApi({ orderId: orderId_, status: nextStatus });
      setOrder((current) =>
        current ? { ...current, status: nextStatus } : current,
      );
    } finally {
      setConfirmLoading(false);
    }
  }, [confirmLoading, orderId_, orderStatus]);
  // END: Toggle trạng thái đơn giữa confirmed và draft

  return {
    order,
    loading,
    error,
    fetchOrder,
    products,
    ...summary,
    isPaid,
    displayProducts,
    showAllProducts,
    toggleShowAllProducts,
    addProductOpen,
    editProductOpen,
    selectedProduct,
    openAddProduct,
    closeAddProduct,
    openEditProduct,
    closeEditProduct,
    addingProduct,
    handleAddProduct,
    updatingProduct,
    handleUpdateProduct,
    depositLoading,
    handleToggleDeposit,
    confirmLoading,
    handleToggleConfirm,
    showShippingScreen,
    openShipping,
    closeShipping,
  };
}
