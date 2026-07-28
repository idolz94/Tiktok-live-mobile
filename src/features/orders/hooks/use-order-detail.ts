import type {
  OrderProduct,
  OrderStatus,
  OrderWithTikTok,
} from "@app-types/index";
import type {
  OrderItemPayload,
  UpdateOrderItemPayload,
} from "@features/orders/types/order";
import { getOrderTotal } from "@features/orders/utils/order";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addOrderItemApi,
  deleteOrderItemApi,
  getOrderByIdApi,
  updateOrderDepositStatusApi,
  updateOrderItemApi,
  updateOrderStatusApi,
} from "../service/api";
import { listCustomerAddressesApi, type CustomerAddress } from "@features/orders/service/create-shipment-api";

// START: Stable fallback để tránh tạo array/object mới mỗi render khi order null
const EMPTY_PRODUCTS: OrderProduct[] = [];

const EMPTY_SUMMARY = {
  productTotal: 0,
  totalQuantity: 0,
  shippingFee: 0,
  codAmount: 0,
  remain: 0,
};
// END: Stable fallback

type UiState = {
  addProductOpen: boolean;
  editProductOpen: boolean;
  showAllProducts: boolean;
  showShippingScreen: boolean;
};

type MutatingState = {
  addProduct: boolean;
  updateProduct: boolean;
  deleteProduct: boolean;
  deposit: boolean;
  confirm: boolean;
};

const UI_INIT: UiState = {
  addProductOpen: false,
  editProductOpen: false,
  showAllProducts: false,
  showShippingScreen: false,
};

const MUTATING_INIT: MutatingState = {
  addProduct: false,
  updateProduct: false,
  deleteProduct: false,
  deposit: false,
  confirm: false,
};

export function useOrderDetail(orderId: string) {
  // data state
  const [order, setOrder] = useState<OrderWithTikTok | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerDefaultAddress, setCustomerDefaultAddress] = useState<CustomerAddress | null>(null);

  // START: Lưu selectedProductId thay vì object để tránh stale reference khi order update
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  // END: Lưu selectedProductId thay vì object

  // START: Gom UI boolean flags — 4 useState → 1
  const [ui, setUi] = useState<UiState>(UI_INIT);
  // END: Gom UI boolean flags

  // START: Gom mutation loading flags — 4 useState → 1
  const [mutating, setMutating] = useState<MutatingState>(MUTATING_INIT);
  // END: Gom mutation loading flags

  const patchUi = useCallback(
    (patch: Partial<UiState>) => setUi((prev) => ({ ...prev, ...patch })),
    [],
  );

  const patchMutating = useCallback(
    (patch: Partial<MutatingState>) =>
      setMutating((prev) => ({ ...prev, ...patch })),
    [],
  );

  // START: Race condition guard — bỏ qua response của request cũ nếu có request mới hơn
  const requestRef = useRef(0);
  // END: Race condition guard

  // START: Ref lock chống double tap — state update async không đủ nhanh để block lần tap thứ 2
  const addingRef = useRef(false);
  const updatingRef = useRef(false);
  const deletingRef = useRef(false);
  const depositRef = useRef(false);
  const confirmRef = useRef(false);
  // END: Ref lock

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

  // Refresh data mà không bật loading toàn màn — dùng sau item mutation
  const silentRefetch = useCallback(async () => {
    if (!orderId) return;
    const requestId = ++requestRef.current;
    try {
      const result = await getOrderByIdApi(orderId);
      if (requestId !== requestRef.current) return;
      if (result) setOrder(result);
    } catch {
      // bỏ qua lỗi silent — UI vẫn giữ data cũ
    }
  }, [orderId]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);
  // END: Fetch order khi màn mở

  // Fetch địa chỉ mặc định của khách sau khi có customerId
  useEffect(() => {
    const customerId = order?.customerId;
    if (!customerId) return;
    let cancelled = false;
    listCustomerAddressesApi(customerId)
      .then((addresses) => {
        if (cancelled) return;
        setCustomerDefaultAddress(addresses.find((a) => a.isDefault) ?? null);
      })
      .catch(() => { /* bỏ qua — fallback hiển thị customerAddress từ order */ });
    return () => { cancelled = true; };
  }, [order?.customerId]);

  // START: Stable products — EMPTY_PRODUCTS tránh tạo [] mới mỗi render khi order null
  const products = order?.products ?? EMPTY_PRODUCTS;
  // END: Stable products

  // START: Tách summary riêng để không tính lại khi showAllProducts đổi
  const summary = useMemo(() => {
    if (!order) return EMPTY_SUMMARY;

    const p = order.products ?? EMPTY_PRODUCTS;
    const productTotal = getOrderTotal(p);
    const totalQuantity = p.reduce((sum, item) => sum + item.quantity, 0);
    const shippingFee = Number(order.shippingFee ?? 0);
    const codAmount = Number(order.codAmount ?? 0);
    const orderTotal = order.totalAmount ?? (productTotal + shippingFee);
    const remain = Math.max(0, orderTotal - codAmount);

    return { productTotal, totalQuantity, shippingFee, codAmount, remain };
  }, [
    order?.products,
    order?.shippingFee,
    order?.codAmount,
    order?.totalAmount,
  ]);
  // END: summary

  // START: Tách displayProducts riêng để không trigger lại summary khi toggle
  const displayProducts = useMemo(
    () => (ui.showAllProducts ? products : products.slice(0, 3)),
    [products, ui.showAllProducts],
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

  const openAddProduct = useCallback(
    () => patchUi({ addProductOpen: true }),
    [patchUi],
  );
  const closeAddProduct = useCallback(
    () => patchUi({ addProductOpen: false }),
    [patchUi],
  );

  const openEditProduct = useCallback(
    (product: OrderProduct) => {
      setSelectedProductId(product.id);
      patchUi({ editProductOpen: true });
    },
    [patchUi],
  );

  const closeEditProduct = useCallback(() => {
    patchUi({ editProductOpen: false });
    setSelectedProductId(null);
  }, [patchUi]);

  const toggleShowAllProducts = useCallback(
    () =>
      setUi((prev) => ({ ...prev, showAllProducts: !prev.showAllProducts })),
    [],
  );

  const openShipping = useCallback(
    () => patchUi({ showShippingScreen: true }),
    [patchUi],
  );
  const closeShipping = useCallback(
    () => patchUi({ showShippingScreen: false }),
    [patchUi],
  );

  const orderId_ = order?.id;

  // START: Thêm sản phẩm — ref lock tránh double tap gửi 2 request trong cùng frame
  const handleAddProduct = useCallback(
    async (payload: OrderItemPayload) => {
      if (!orderId || addingRef.current) return;

      addingRef.current = true;
      patchMutating({ addProduct: true });
      try {
        await addOrderItemApi(orderId, payload);
        await silentRefetch();
        patchUi({ addProductOpen: false });
      } finally {
        addingRef.current = false;
        patchMutating({ addProduct: false });
      }
    },
    [orderId, patchMutating, patchUi, silentRefetch],
  );
  // END: Thêm sản phẩm

  // START: Cập nhật sản phẩm — ref lock tránh double tap
  const handleUpdateProduct = useCallback(
    async (itemId: string, payload: UpdateOrderItemPayload) => {
      if (!orderId || updatingRef.current) return;

      updatingRef.current = true;
      patchMutating({ updateProduct: true });
      try {
        // ponytail: capture prevProducts qua functional setOrder để tránh stale closure
        let prevProducts: OrderProduct[] = [];
        setOrder((prev) => {
          prevProducts = prev?.products ?? [];
          return prev;
        });
        await updateOrderItemApi(orderId, itemId, payload);
        await silentRefetch();
        // Merge lại các display field từ item cũ nếu server trả về empty
        setOrder((prev) => {
          if (!prev) return prev;
          const products = prev.products.map((p) => {
            if (p.id !== itemId) return p;
            const old = prevProducts.find((o) => o.id === itemId);
            if (!old) return p;
            const price = p.price > 0 ? p.price : old.price;
            return {
              ...p,
              code: p.code || old.code,
              name: (p.name && p.name !== "Sản phẩm") ? p.name : old.name,
              color: p.color || old.color,
              variantName: p.variantName || old.variantName,
              price,
              totalAmount: (p.totalAmount ?? 0) > 0 ? p.totalAmount : p.quantity * price,
            };
          });
          // ponytail: đồng bộ order-level productName từ firstProduct sau merge
          // để order summary không hiển thị "Sản phẩm" sai khi server trả productName null
          const firstMerged = products[0];
          const productName =
            firstMerged && firstMerged.name && firstMerged.name !== "Sản phẩm"
              ? firstMerged.name
              : (prev.productName && prev.productName !== "Sản phẩm")
                ? prev.productName
                : firstMerged?.name ?? prev.productName;
          return { ...prev, products, productName };
        });
        patchUi({ editProductOpen: false });
        setSelectedProductId(null);
      } finally {
        updatingRef.current = false;
        patchMutating({ updateProduct: false });
      }
    },
    [orderId, patchMutating, patchUi, silentRefetch],
  );
  // END: Cập nhật sản phẩm

  // START: Xoá sản phẩm — ref lock tránh double tap
  const handleDeleteProduct = useCallback(
    async (itemId: string) => {
      if (!orderId || deletingRef.current) return;
      deletingRef.current = true;
      patchMutating({ deleteProduct: true });
      try {
        await deleteOrderItemApi(orderId, itemId);
        await silentRefetch();
      } finally {
        deletingRef.current = false;
        patchMutating({ deleteProduct: false });
      }
    },
    [orderId, patchMutating, silentRefetch],
  );
  // END: Xoá sản phẩm

  // START: Toggle cọc/chưa cọc — đồng bộ với list Orders
  const handleToggleDeposit = useCallback(async () => {
    if (!orderId_ || depositRef.current) return;

    const nextStatus = isPaid ? "unpaid" : "paid";

    depositRef.current = true;
    patchMutating({ deposit: true });

    try {
      await updateOrderDepositStatusApi({
        orderId: orderId_,
        depositStatus: nextStatus,
      });
      setOrder((current) =>
        current ? { ...current, depositStatus: nextStatus } : current,
      );
    } finally {
      depositRef.current = false;
      patchMutating({ deposit: false });
    }
  }, [isPaid, orderId_, patchMutating]);
  // END: Toggle cọc/chưa cọc

  // START: Toggle trạng thái đơn giữa confirmed và draft — ref lock tránh double tap
  const orderStatus = order?.status;

  const handleToggleConfirm = useCallback(async () => {
    if (!orderId_ || confirmRef.current || orderStatus !== "draft") return;

    const nextStatus: OrderStatus = "confirmed";

    confirmRef.current = true;
    patchMutating({ confirm: true });
    try {
      await updateOrderStatusApi({ orderId: orderId_, status: nextStatus });
      setOrder((current) =>
        current ? { ...current, status: nextStatus } : current,
      );
    } finally {
      confirmRef.current = false;
      patchMutating({ confirm: false });
    }
  }, [orderId_, orderStatus, patchMutating]);
  // END: Toggle trạng thái đơn

  return {
    order,
    loading,
    error,
    fetchOrder,
    customerDefaultAddress,
    products,
    ...summary,
    isPaid,
    displayProducts,
    showAllProducts: ui.showAllProducts,
    toggleShowAllProducts,
    addProductOpen: ui.addProductOpen,
    editProductOpen: ui.editProductOpen,
    selectedProduct,
    openAddProduct,
    closeAddProduct,
    openEditProduct,
    closeEditProduct,
    addingProduct: mutating.addProduct,
    handleAddProduct,
    updatingProduct: mutating.updateProduct,
    handleUpdateProduct,
    deletingProduct: mutating.deleteProduct,
    handleDeleteProduct,
    depositLoading: mutating.deposit,
    handleToggleDeposit,
    confirmLoading: mutating.confirm,
    handleToggleConfirm,
    showShippingScreen: ui.showShippingScreen,
    openShipping,
    closeShipping,
  };
}
