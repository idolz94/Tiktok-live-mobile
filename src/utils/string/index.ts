import { Noop } from "react-hook-form";

/**
 * @param comma dấu phân cách. mặc định là dấu ','
 */
export function convertStringToNumber(str: string | undefined): number {
  if (!str) {
    return 0;
  }

  // Loại bỏ dấu phân cách từ chuỗi (ví dụ: chuyển "1.000" thành "1000")
  const cleanedStr = str.replace(/\,/g, "");

  const convertedNumber = parseFloat(cleanedStr);

  if (isNaN(convertedNumber)) {
    return 0; // Trả về 0 nếu không thể chuyển đổi thành số
  }

  return convertedNumber; // Trả về số nếu có thể chuyển đổi
}

/**
 * sử dụng cho mấy ô input bắt nhập số tiền
 * @param str
 * @returns
 */
export function formatCurrency(str: string | undefined): string {
  if (!str) {
    return "";
  }

  let cleanedStr = str;

  // Kiểm tra nếu chuỗi kết thúc bằng dấu ","
  if (cleanedStr.endsWith(",")) {
    // Thay dấu "," cuối cùng bằng "."
    cleanedStr = cleanedStr.slice(0, -1) + ".";
  }

  // Loại bỏ dấu phân cách từ chuỗi (ví dụ: chuyển "1,000" thành "1000")
  cleanedStr = cleanedStr.replace(/\,/g, "");

  // Giữ nguyên khi người dùng mới nhập dấu âm hoặc "-."
  if (cleanedStr === "-" || cleanedStr === "-.") {
    return cleanedStr;
  }

  if (isNaN(parseFloat(cleanedStr))) {
    return "";
  }

  if (cleanedStr.includes(".")) {
    const [intPart, decPart] = cleanedStr.split(".");

    return parseInt(intPart).currencyFormat() + "." + (decPart ?? "");
  }

  return parseFloat(cleanedStr).currencyFormat();
}


/**
 * Loại bỏ một số 0 ở đầu số điện thoại nội địa nếu có.
 *
 * Ví dụ:
 *  - "0901234567" -> "901234567"
 *  - "901234567" -> "901234567"
 *
 * @param phoneNumber Số nội địa cần xử lý
 * @returns Số nội địa không có số 0 ở đầu
 */
function removeLeadingZero(phoneNumber: string) {
  // Biểu thức chính quy để kiểm tra và thay thế
  const regex = /^0(\d+)$/;

  // Kiểm tra xem chuỗi có khớp với biểu thức chính quy hay không
  const match = phoneNumber.match(regex);

  // Nếu có khớp, thay thế bằng nội dung của nhóm thứ nhất
  if (match) {
    return match[1];
  } else {
    // Nếu không khớp, trả về nguyên chuỗi
    return phoneNumber;
  }
}

/**
 * Mã gọi quốc tế phổ biến dùng để phân tích số điện thoại.
 * Sắp xếp từ dài đến ngắn nhằm tránh khớp một phần (ví dụ: 886 trước 86).
 *
 * Hiện tại chỉ đặt VN chứ nếu check toàn bộ thì có nhiều case lỗi. BE như cc
 */
const CALLING_CODES_DESC = [
  "84", // VN
];

/**
 * Trích xuất mã gọi quốc tế và số nội địa đã chuẩn hóa từ đầu vào.
 *
 * Hành vi:
 *  - Loại bỏ khoảng trắng đầu/cuối
 *  - Bỏ dấu '+' nếu có ở đầu
 *  - Nhận diện mã gọi quốc gia ở đầu từ danh sách (ưu tiên chuỗi dài)
 *  - Trả về dialCode dạng "+<code>" nếu nhận diện được, ngược lại chuỗi rỗng
 *  - Chuẩn hóa số nội địa bằng cách bỏ một số '0' ở đầu nếu có
 *
 * Ví dụ:
 *  - "+84901234567" -> { dialCode: "+84", number: "901234567" }
 *  - "6598765432" -> { dialCode: "+65", number: "98765432" }
 *  - "0901234567" -> { dialCode: "", number: "901234567" }
 *
 * @param phone Chuỗi số điện thoại thô
 * @returns Đối tượng gồm mã gọi quốc tế và số nội địa đã chuẩn hóa
 */
export function extractPhoneNumber(phone: string | null | undefined): {
  dialCode: string | null;
  number: string | null;
} {
  if (!phone) {
    return { dialCode: null, number: null };
  }

  const trimmed = String(phone).trim();
  const hadPlus = trimmed.startsWith("+");
  const withoutPlus = hadPlus ? trimmed.slice(1) : trimmed;

  for (const code of CALLING_CODES_DESC) {
    if (withoutPlus.startsWith(code)) {
      const national = withoutPlus.slice(code.length);
      const normalized = removeLeadingZero(national);
      return { dialCode: `+${code}`, number: normalized };
    }
  }

  // No calling code recognized; return as-is
  return { dialCode: null, number: removeLeadingZero(withoutPlus) };
}

/**
 * Trợ giúp tương thích ngược, chỉ trả về số nội địa đã chuẩn hóa.
 *
 * @param phone Chuỗi số điện thoại thô
 * @returns Số nội địa đã chuẩn hóa (bỏ '+' và mã quốc gia; bỏ số 0 ở đầu)
 */
export function removeDialCode(
  phone: string | null | undefined,
): string | null {
  return extractPhoneNumber(phone).number;
}

export function formatToInteger(num?: string): number {
  if (!num) return 0;
  const parsedNum = Number(num.replace(/,/g, ""));
  return isNaN(parsedNum) ? 0 : Math.round(parsedNum);
}

/**
 * Kết hợp chuỗi số điện thoại từ mã gọi quốc tế và số nội địa tùy chọn.
 *
 * Hành vi:
 *  - Cắt khoảng trắng; bỏ dấu '+' nếu có trong dialCode
 *  - Nếu có dialCode: trả về `${dialCode}${numberWithoutLeadingZero}`
 *  - Nếu không có dialCode: trả về số nội địa đảm bảo BẮT ĐẦU bằng một ký tự '0'
 *  - Chuỗi trả về không bao giờ bắt đầu bằng '+'
 *
 * Ví dụ:
 *  - ("+84", "0901234567") -> "84901234567"
 *  - ("84",  "901234567")  -> "84901234567"
 *  - ("",    "901234567")  -> "0901234567"
 *  - (null,  "0901234567") -> "0901234567"
 *
 * @param dialCode Mã gọi quốc tế, có hoặc không có dấu '+'
 * @param number Số nội địa (có thể bắt đầu bằng 0)
 * @returns Chuỗi ghép dialCode+number (không có '+'); hoặc số địa phương bắt đầu bằng '0' nếu không có dialCode
 */
export function composePhoneFromDialAndNumber(
  dialCode: string | null | undefined,
  number: string | null | undefined,
): string {
  const rawDial = (dialCode ?? "").trim();
  const rawNum = (number ?? "").trim();

  const normalizedDial = rawDial.replace(/^\+/, "");

  if (normalizedDial) {
    // When dialing with an international code, remove a single leading '0' from the national number
    const normalizedNum = removeLeadingZero(rawNum);
    return `${normalizedDial}${normalizedNum}`;
  }

  // No dial code: ensure local format starts with a single leading '0'
  if (!rawNum) return "";
  return rawNum.startsWith("0") ? rawNum : `0${rawNum}`;
}

export const removeAccentAndTrimWhenBlurInput =
  (
    onChange: (...event: any[]) => void,
    onBlur: Noop,
    options?: { uppercase?: boolean },
  ) =>
  (txt: string | null | undefined) => {
    {
      const { uppercase = false } = options ?? {};

      let val = txt
        ?.replace(/[\s]+/g, " ")
        .replaceAll("Đ", "D")
        .removeAccent()
        .trim();

      if (uppercase) {
        val = val?.toUpperCase();
      }

      onChange(val);

      onBlur();
    }
  };


export function toStringArray(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function toNumber(value: unknown, fallback = 0) {
  const nextValue = Number(value);

  if (Number.isNaN(nextValue)) return fallback;

  return nextValue;
}
