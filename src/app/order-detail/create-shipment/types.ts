import { z } from "zod";

export type Transport = "road" | "fly";
export type PaymentSide = 0 | 1;
export type ViewCondition = "fragile" | "viewable" | "no_open";
export type PickupOption = "cod" | "post";
export type DeliveryPolicy = "full" | "partial";
export type RefusalFee = "free" | "charge";

export type ServiceType = 1 | 2;
export type CollectType = 1 | 2;

export type SpxTimeslot = {
  date: string;
  pickupTime: number;
  slots: Array<{ id: number; range: string }>;
};

const VN_PHONE_RE = /^(0|\+84)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])\d{7}$/;
const fullNamePattern = /^[\p{L}\s]+$/u;

export const addrSchema = z.object({
  label: z.string(),
  name: z
    .string()
    .trim()
    .min(1, "Tên không được bỏ trống")
    .regex(fullNamePattern, "Họ và tên chỉ được gồm chữ cái và khoảng trắng"),
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
