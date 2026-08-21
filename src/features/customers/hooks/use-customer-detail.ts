import { useCallback, useEffect, useState } from "react";
import {
  getCustomerAddressesApi,
  getCustomerAnalyticsApi,
  getCustomerApi,
  getCustomerOrdersApi,
} from "../service/api";
import type { CustomerAnalytics } from "../service/api";
import type {
  CustomerAddress,
  CustomerDetail,
  CustomerOrderItem,
  OrderStatus as CustomerOrderStatus,
} from "../types/customer-detail";

export function useCustomerDetail(customerId: string) {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [orders, setOrders] = useState<CustomerOrderItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  const loadCustomer = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await getCustomerApi(customerId);
      setCustomer(res.customer);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không tải được thông tin khách hàng.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      setOrdersError("");
      const res = await getCustomerOrdersApi(customerId);
      // Shared Order dùng OrderStatus 3 trạng thái; backend trả 6 trạng thái nên cast về enum local
      setOrders(
        res.orders.map((order) => ({
          id: order.id,
          orderCode: order.orderCode ?? null,
          status: order.status as CustomerOrderStatus,
          shippingStatus: order.shippingStatus ?? null,
          totalAmount: order.totalAmount ?? 0,
          codAmount: order.codAmount ?? null,
          createdAt: order.createdAt,
        })),
      );
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : "Không tải được đơn hàng.");
    } finally {
      setIsLoadingOrders(false);
    }
  }, [customerId]);

  const loadAddresses = useCallback(async () => {
    try {
      setIsLoadingAddresses(true);
      const res = await getCustomerAddressesApi(customerId);
      setAddresses(res.addresses);
    } catch {
      // ponytail: lỗi addresses không chặn màn hình — hiển thị empty state
      setAddresses([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [customerId]);

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoadingAnalytics(true);
      const res = await getCustomerAnalyticsApi(customerId);
      setAnalytics(res.analytics);
    } catch {
      setAnalytics(null);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;
    void loadCustomer();
    void loadOrders();
    void loadAddresses();
    void loadAnalytics();
  }, [customerId, loadCustomer, loadOrders, loadAddresses, loadAnalytics]);

  const refetch = useCallback(() => {
    void loadCustomer();
    void loadOrders();
    void loadAddresses();
    void loadAnalytics();
  }, [loadCustomer, loadOrders, loadAddresses, loadAnalytics]);

  const handleSelectAddress = useCallback((_address: CustomerAddress) => {
    // ponytail: chưa có màn tạo đơn hàng — khi có create-order thì navigate kèm addressId
  }, []);

  return {
    customer,
    isLoading,
    error,
    refetch,
    orders,
    isLoadingOrders,
    ordersError,
    addresses,
    isLoadingAddresses,
    analytics,
    isLoadingAnalytics,
    handleSelectAddress,
  };
}
