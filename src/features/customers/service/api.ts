import type { Order } from "@app-types/index";
import { getRequest, patchRequest } from "@utils/http/request-sse";
import { normalizeApiOrderForUi } from "@features/orders/utils/order";
import type { CustomerAddress, CustomerDetail } from "../types/customer-detail";

type UpdateCustomerPayload = {
  customerType?: string | null;
  phone?: string | null;
  referenceInfo?: string | null;
};

export type CustomerListItem = {
  id: string;
  tiktokUsername: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  customerType: string | null;
  totalOrders: number | null;
  totalSpent: number | null;
  lastOrderAt: string | null;
  createdAt: string | null;
};

let customersCache: CustomerListItem[] | null = null;
let customersRequest: Promise<CustomerListItem[]> | null = null;

export function getCustomersApi(force = false) {
  if (!force && customersCache) return Promise.resolve(customersCache);
  if (!force && customersRequest) return customersRequest;

  customersRequest = getRequest<{ customers: CustomerListItem[] }>("/customers")
    .then((res) => {
      customersCache = res.customers;
      return res.customers;
    })
    .finally(() => {
      customersRequest = null;
    });

  return customersRequest;
}

export function getCustomerApi(customerId: string) {
  return getRequest<{ customer: CustomerDetail }>(`/customers/${customerId}`);
}

// ponytail: normalize qua normalizeApiOrderForUi (giống OrderItem/"Đơn Đã Tạo") để order.products
// LUÔN có ít nhất 1 phần tử (fallback từ commentText nếu order không match preset nào) — OrderCard
// trong customer-detail-sheet trước đây nhận response thô, tự chế fallback riêng dựa vào các field
// (order.price/order.quantity) không tồn tại trên bảng orders nên luôn hiện sai/"Sản phẩm"/0đ.
export async function getCustomerOrdersApi(customerId: string) {
  const data = await getRequest<{ orders: Order[] }>(`/customers/${customerId}/orders`);
  return { orders: data.orders.map((order) => normalizeApiOrderForUi(order)) };
}

export function getCustomerAddressesApi(customerId: string) {
  return getRequest<{ addresses: CustomerAddress[] }>(
    `/customers/${customerId}/addresses`,
  );
}

export type CustomerOverview = {
  totalCustomers: number;
  byType: Record<string, number>;
  topSpenders: {
    id: string;
    displayName: string | null;
    tiktokUsername: string | null;
    avatarUrl: string | null;
    totalOrders: number | null;
    totalSpent: number | null;
  }[];
};

export function getCustomerOverviewApi() {
  return getRequest<CustomerOverview>("/customers/overview");
}

export type CustomerAnalytics = {
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderAmount: number | null;
  lastOrderAt: string | null;
  byStatus: Record<string, number>;
  topProducts: { productCode: string | null; productName: string | null; quantity: number }[];
};

export function getCustomerAnalyticsApi(customerId: string) {
  return getRequest<{ analytics: CustomerAnalytics }>(`/customers/${customerId}/analytics`);
}

export function updateCustomerApi(customerId: string, payload: UpdateCustomerPayload) {
  customersCache = null;
  return patchRequest(`/customers/${customerId}`, payload);
}
