// Gom các CommentIntent (Backend trả về — xem Backend/src/services/comment-scoring) thành nhóm
// hành động seller cần làm, dùng chung cho toàn bộ feature tiktok-live (feed Live + tab "Cần xử lý")
// để 2 màn hình luôn đồng bộ khi Backend thêm/sửa intent — tránh lặp lại bug "thiếu label" đã gặp.
export type IntentGroup = "ready" | "consult" | "question" | "none";

const READY_INTENTS = new Set(["buy", "buying", "already_ordered"]);
const CONSULT_INTENTS = new Set(["undecided", "ask_product_demo"]);
const QUESTION_INTENTS = new Set([
  "ask_price",
  "ask_stock",
  "ask_shipping",
  "ask_how_to_buy",
  "ask_product",
]);

export function getIntentGroup(intent?: string | null): IntentGroup {
  const key = String(intent || "").toLowerCase();

  if (READY_INTENTS.has(key)) return "ready";
  if (CONSULT_INTENTS.has(key)) return "consult";
  if (QUESTION_INTENTS.has(key)) return "question";

  return "none";
}

// Nhãn đầy đủ — dùng ở danh sách/tab "Cần xử lý".
export const INTENT_LABEL: Record<string, string> = {
  buy: "Mua",
  buying: "Mua",
  already_ordered: "Đã đặt hàng",
  undecided: "Đang phân vân",
  ask_product_demo: "Xem mẫu",
  ask_price: "Hỏi giá",
  ask_stock: "Hỏi tồn",
  ask_shipping: "Hỏi ship",
  ask_how_to_buy: "Cách mua",
  ask_product: "Hỏi sản phẩm",
};

// Nhãn ngắn, hành động rõ — dùng cho badge nhỏ trên card comment ở feed Live.
export const INTENT_BADGE_LABEL: Record<string, string> = {
  buy: "Chốt đơn",
  buying: "Chốt đơn",
  already_ordered: "Đã đặt",
  undecided: "Cần tư vấn",
  ask_product_demo: "Xem mẫu",
  ask_price: "Hỏi giá",
  ask_stock: "Hỏi tồn",
  ask_shipping: "Hỏi ship",
  ask_how_to_buy: "Cách mua",
  ask_product: "Hỏi sản phẩm",
};

export function getIntentLabel(intent?: string | null): string {
  const key = String(intent || "").toLowerCase();

  return INTENT_LABEL[key] || String(intent || "");
}

export function getIntentBadgeLabel(intent?: string | null): string {
  const key = String(intent || "").toLowerCase();

  return INTENT_BADGE_LABEL[key] || "";
}
