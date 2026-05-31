import { Order } from "@types";

export type CustomerItem = {
  username: string;
  avatar?: string;
  totalComments: number;
  totalOrders: number;
  latestComment: string;
};

export const buildCustomersFromOrders = (orders: Order[]): CustomerItem[] => {
  const map = new Map<string, CustomerItem>();

  orders.forEach((order) => {
    const username = order.username || "Unknown user";
    const current = map.get(username);

    if (!current) {
      map.set(username, {
        username,
        avatar: order.avatar,
        totalComments: 0,
        totalOrders: 1,
        latestComment: order.comment || order.latestComment || "",
      });
      return;
    }

    current.totalOrders += 1;
    if (!current.latestComment) current.latestComment = order.comment || "";
  });

  return Array.from(map.values()).sort((a, b) => b.totalOrders - a.totalOrders);
};
