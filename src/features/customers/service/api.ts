import type { Order } from "@app-types/index";
import { getRequest, patchRequest } from "@utils/http/request-sse";

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
  return getRequest<{ customer: { customerType?: string | null; phone?: string | null; referenceInfo?: string | null } }>(
    `/customers/${customerId}`,
  );
}

export function getCustomerOrdersApi(customerId: string) {
  return getRequest<{ orders: Order[] }>(`/customers/${customerId}/orders`);
}

export function updateCustomerApi(customerId: string, payload: UpdateCustomerPayload) {
  customersCache = null;
  return patchRequest(`/customers/${customerId}`, payload);
}
