import type { OrderProduct, OrderWithTikTok } from "../types";
import { cleanTikTokUsername } from "./tiktok";
import { createId } from "./id";
import { getOrderTikTokUsername } from "./tiktok";

export const DEFAULT_PRODUCT_PRICE = 20; // 20 = 20.000đ
export const DEFAULT_PRODUCT_QUANTITY = 1;

export function parseOrderFromComment(comment: string) {
  const text = comment.toLowerCase();
  const quantityMatch = text.match(
    /(?:x|sl|số lượng)?\s*(\d+)\s*(?:cái|c|sp|sản phẩm)?/i,
  );
  const sizeMatch = text.match(/\b(size|sz)\s*([a-z0-9]+)/i);
  const colorMatch = text.match(
    /\b(đen|trắng|đỏ|xanh|vàng|hồng|be|nâu|kem|tím|cam|ghi|xám)\b/i,
  );

  return {
    productName: comment.trim(),
    quantity: quantityMatch
      ? Number(quantityMatch[1])
      : DEFAULT_PRODUCT_QUANTITY,
    size: sizeMatch?.[2]?.toUpperCase() || "",
    color: colorMatch?.[1] || "",
    price: DEFAULT_PRODUCT_PRICE,
  };
}

export function normalizeProductForUi(product: any, order?: any): OrderProduct {
  const code = String(
    product?.code || product?.product_code || product?.productCode || "",
  );
  const name = String(
    product?.name ||
      product?.product_name ||
      product?.productName ||
      order?.productName ||
      order?.product_name ||
      order?.comment ||
      order?.comment_text ||
      "Sản phẩm",
  );
  const quantity = Number(product?.quantity || 1);
  const price = Number(product?.price || order?.price || 0);
  const totalAmount = Number(
    product?.totalAmount || product?.total_amount || quantity * price,
  );

  return {
    id: String(product?.id || createId()),
    code,
    name,
    variantName: String(product?.variantName || product?.variant_name || ""),
    color: String(product?.color || order?.color || ""),
    size: String(product?.size || order?.size || ""),
    quantity,
    price,
    totalAmount,
    rawCommentText: String(
      product?.rawCommentText ||
        product?.raw_comment_text ||
        order?.comment ||
        order?.comment_text ||
        "",
    ),
  };
}

export function createProductFromComment(comment: string): OrderProduct {
  const cleanComment = comment.trim() || "Sản phẩm";

  return normalizeProductForUi({
    id: createId(),
    code: cleanComment,
    name: cleanComment,
    quantity: DEFAULT_PRODUCT_QUANTITY,
    price: DEFAULT_PRODUCT_PRICE,
    rawCommentText: cleanComment,
  });
}

export function formatMoneyFromK(value: number) {
  const safeValue = Number(value || 0);
  return `${safeValue.toLocaleString("vi-VN")}.000đ`;
}

export function getProductTotal(
  product: Pick<OrderProduct, "price" | "quantity">,
) {
  return Number(product.price || 0) * Number(product.quantity || 0);
}

export function getOrderTotal(products: OrderProduct[] = []) {
  return products.reduce((sum, product) => sum + getProductTotal(product), 0);
}

function buildFallbackProduct(order: any): OrderProduct {
  const comment = String(order?.comment || order?.comment_text || "Sản phẩm");

  return normalizeProductForUi(
    {
      id: order?.id || createId(),
      code: "",
      name: comment,
      quantity: Number(order?.quantity || 1),
      price: Number(
        order?.price ||
          order?.subtotalAmount ||
          order?.subtotal_amount ||
          DEFAULT_PRODUCT_PRICE,
      ),
      color: order?.color || "",
      size: order?.size || "",
      rawCommentText: comment,
    },
    order,
  );
}

export function normalizeApiOrderForUi(order: any): OrderWithTikTok {
  const customerTikTokUsername = getOrderTikTokUsername(order);
  const rawProducts = Array.isArray(order?.products) ? order.products : [];
  const products = rawProducts.length
    ? rawProducts.map((product: any) => normalizeProductForUi(product, order))
    : [buildFallbackProduct(order)];

  const firstProduct = products[0];
  const orderCode = String(order?.orderCode || order?.order_code || "");
  const comment = String(
    order?.comment ||
      order?.commentText ||
      order?.comment_text ||
      firstProduct.rawCommentText ||
      "",
  );
  const createdAt = String(
    order?.createdAt || order?.created_at || new Date().toISOString(),
  );
  const subtotalAmount = Number(
    order?.subtotalAmount || order?.subtotal_amount || getOrderTotal(products),
  );
  const totalAmount = Number(
    order?.totalAmount || order?.total_amount || subtotalAmount,
  );

  return {
    id: String(order?.id || createId()),
    orderCode,
    username: String(
      order?.username ||
        order?.customerName ||
        order?.customer_name ||
        customerTikTokUsername ||
        "Khách live",
    ),
    customerName: String(
      order?.customerName || order?.customer_name || order?.username || "",
    ),
    customerTikTokUsername,
    customerTikTokName: customerTikTokUsername,
    uniqueId: cleanTikTokUsername(customerTikTokUsername),
    avatar: String(
      order?.avatar || order?.avatarUrl || order?.avatar_url || "",
    ),
    avatarUrl: String(
      order?.avatarUrl || order?.avatar || order?.avatar_url || "",
    ),
    comment,
    commentId: String(
      order?.commentId || order?.comment_id || order?.live_comment_id || "",
    ),
    productName: String(
      order?.productName || order?.product_name || firstProduct.name || comment,
    ),
    quantity: Number(order?.quantity || firstProduct.quantity || 1),
    size: String(order?.size || firstProduct.size || ""),
    color: String(order?.color || firstProduct.color || ""),
    price: Number(order?.price || firstProduct.price || 0),
    products,
    status: order?.status || "draft",
    depositStatus: order?.depositStatus || order?.deposit_status || "unpaid",
    paymentStatus: order?.paymentStatus || order?.payment_status || "unpaid",
    shippingStatus:
      order?.shippingStatus || order?.shipping_status || "not_shipped",
    subtotalAmount,
    shippingFee: Number(order?.shippingFee || order?.shipping_fee || 0),
    discountAmount: Number(
      order?.discountAmount || order?.discount_amount || 0,
    ),
    totalAmount,
    codAmount: Number(order?.codAmount || order?.cod_amount || totalAmount),
    note: String(order?.note || ""),
    createdAt,
    updatedAt: String(order?.updatedAt || order?.updated_at || ""),
  };
}
