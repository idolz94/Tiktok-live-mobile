import { Order } from "@app-types/index";
import { loadObject, saveObject, remove, STORAGE_KEYS } from "@utils/storage";

export function readOrders(): Order[] {
  try {
    const parsed = loadObject<Order[]>(STORAGE_KEYS.ORDERS);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeOrders(orders: Order[]) {
  saveObject(STORAGE_KEYS.ORDERS, orders);
}

export function addOrderToStorage(order: Order) {
  const oldOrders = readOrders();

  const existed = oldOrders.some((item) => item.id === order.id);

  if (existed) return oldOrders;

  const nextOrders = [order, ...oldOrders];

  writeOrders(nextOrders);

  return nextOrders;
}

export function clearOrdersStorage() {
  remove(STORAGE_KEYS.ORDERS);
}

