export const VN_PHONE_RE = /^(\+84|0)(3[2-9]|5[25689]|7[06-9]|8[1-689]|9[0-46-8])\d{7}$/;

export function validatePhoneVN(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length < 10 || digits.length > 12) return "Số điện thoại phải từ 10 đến 12 chữ số";
  if (!VN_PHONE_RE.test(value)) return "Số điện thoại không đúng nhà mạng Việt Nam";
  return "";
}
