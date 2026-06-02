import { Order } from "@app-types/index";
import { loadObject, saveObject, remove, STORAGE_KEYS } from "@utils/storage";

export const readOrders = async (): Promise<Order[]> => {
  return loadObject<Order[]>(STORAGE_KEYS.ORDERS) ?? [];
};

export const writeOrders = async (orders: Order[]): Promise<void> => {
  saveObject(STORAGE_KEYS.ORDERS, orders);
};

export const clearOrdersStorage = async (): Promise<void> => {
  remove(STORAGE_KEYS.ORDERS);
};
