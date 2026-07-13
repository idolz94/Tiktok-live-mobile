import { getRequest, patchRequest } from "@utils/http/request-sse";

export type InvoiceContent = {
  companyName: string;
  companyAddress: string;
  recordNumb: number;
};

export function getInvoiceContentApi() {
  return getRequest<InvoiceContent>("/me/shop-settings/invoice-content");
}

export function updateInvoiceContentApi(payload: Partial<InvoiceContent>) {
  return patchRequest<InvoiceContent>("/me/shop-settings/invoice-content", payload);
}
