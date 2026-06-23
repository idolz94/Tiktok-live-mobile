import { z } from "zod";

export type Transport = "road" | "fly";
export type PaymentOption = "sender" | "receiver";
export type ViewCondition = "fragile" | "viewable" | "no_open";
export type PickupOption = "cod" | "post";
export type DeliveryPolicy = "full" | "partial";
export type RefusalFee = "free" | "charge";

const VN_PHONE_RE = /^(0|\+84)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])\d{7}$/;

export const addrSchema = z.object({
  label: z.string(),
  name: z.string().trim().min(1, "Tên không được bỏ trống"),
  phone: z
    .string()
    .trim()
    .refine((v) => VN_PHONE_RE.test(v), "Số điện thoại không hợp lệ"),
  address: z.string(),
  province: z.string().trim().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  district: z.string().trim().min(1, "Vui lòng chọn Quận/Huyện"),
  ward: z.string().trim().min(1, "Vui lòng chọn Phường/Xã"),
  isDefault: z.boolean(),
});

export type AddrFormValues = z.infer<typeof addrSchema>;
