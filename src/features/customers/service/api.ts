import { getRequest, patchRequest } from "@utils/http/request-sse";

type UpdateCustomerPayload = {
  customerType?: string | null;
  phone?: string | null;
  referenceInfo?: string | null;
};

export function getCustomerApi(customerId: string) {
  return getRequest<{ customer: { customerType?: string | null; phone?: string | null; referenceInfo?: string | null } }>(
    `/customers/${customerId}`,
  );
}

export function updateCustomerApi(customerId: string, payload: UpdateCustomerPayload) {
  return patchRequest(`/customers/${customerId}`, payload);
}
