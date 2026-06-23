import { ShopAddress, CustomerAddress, AddressPayload } from "./create-shipment-api";
import { AddrFormValues } from "./types";

export function parseLocaleNumber(text: string): number {
  return parseInt(text.replace(/\D/g, ""), 10) || 0;
}

export function formatLocaleInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}

export function addressLine(a: ShopAddress | CustomerAddress | null): string {
  if (!a) return "—";
  return [a.address, a.ward, a.district, a.province].filter(Boolean).join(", ");
}

export const absoluteFill = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export function formInitialValues(addr: ShopAddress | CustomerAddress | null): Partial<AddrFormValues> | undefined {
  if (!addr) return undefined;
  return {
    label: addr.label ?? "",
    name: addr.name ?? "",
    phone: addr.phone ?? "",
    address: addr.address ?? "",
    province: addr.province ?? "",
    district: addr.district ?? "",
    ward: addr.ward ?? "",
    isDefault: Boolean(addr.isDefault),
  };
}

export function addressPayload(values: AddrFormValues): AddressPayload {
  return {
    label: values.label.trim() || null,
    name: values.name.trim(),
    phone: values.phone.trim(),
    address: values.address.trim() || null,
    province: values.province.trim(),
    district: values.district.trim(),
    ward: values.ward.trim(),
    isDefault: values.isDefault,
  };
}
