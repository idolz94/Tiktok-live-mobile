import { patchRequest } from "@utils/http/request-sse";

type UpdateCustomerPayload = {
  customerType?: string | null;
  phone?: string | null;
  referenceInfo?: string | null;
};

export function updateCustomerApi(customerId: string, payload: UpdateCustomerPayload) {
  return patchRequest(`/customers/${customerId}`, payload);
}
