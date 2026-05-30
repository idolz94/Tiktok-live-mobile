import AsyncStorage from "@react-native-async-storage/async-storage";
import { Order } from "@/types";

const ORDERS_STORAGE_KEY = "ORDERS";

export async function readOrders(): Promise<Order[]> {
  try {
    const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeOrders(orders: Order[]) {
  await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

export async function clearOrdersStorage() {
  await AsyncStorage.removeItem(ORDERS_STORAGE_KEY);
}
