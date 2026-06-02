import { OrderProduct } from "@app-types/index";
import { createId } from "@utils/id";

export const DEFAULT_PRODUCT_PRICE = 20;
export const DEFAULT_PRODUCT_QUANTITY = 1;

export function parseOrderFromComment(comment: string) {
  const text = String(comment || "");
  const quantityMatch =
    text.match(/(?:x|sl|số lượng)\s*(\d+)/i) ||
    text.match(/\b(\d+)\s*(cái|sp|chiếc)\b/i);
  const priceMatch = text.match(/(?:giá|price)\s*(\d+)/i);
  const sizeMatch = text.match(/(?:size|sz)\s*([a-z0-9]+)/i);
  const colorMatch = text.match(/(?:màu|color)\s*([\p{L}a-z0-9]+)/iu);

  return {
    quantity: quantityMatch
      ? Number(quantityMatch[1])
      : DEFAULT_PRODUCT_QUANTITY,
    price: priceMatch ? Number(priceMatch[1]) : DEFAULT_PRODUCT_PRICE,
    size: sizeMatch?.[1] || "",
    color: colorMatch?.[1] || "",
  };
}

export function createProductFromComment(comment: string): OrderProduct {
  const parsed = parseOrderFromComment(comment);

  return {
    id: createId(),
    code: `SP${Date.now().toString().slice(-6)}`,
    name: comment || "Sản phẩm live",
    price: parsed.price,
    quantity: parsed.quantity,
  };
}

export function formatMoneyFromK(value: number) {
  const realValue = Math.round((value || 0) * 1000);
  return `${realValue.toLocaleString("vi-VN")}đ`;
}

export function getProductTotal(product: OrderProduct) {
  return (product.price || 0) * (product.quantity || 0);
}

export function getOrderTotal(products: OrderProduct[]) {
  return (products || []).reduce(
    (sum, product) => sum + getProductTotal(product),
    0,
  );
}
