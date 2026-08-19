import { buildMergeGroups } from "./merge-groups";
import type { OrderWithTikTok } from "@app-types/index";

function mockOrder(overrides: Partial<OrderWithTikTok> & { id: string }): OrderWithTikTok {
  return {
    id: overrides.id,
    orderCode: overrides.orderCode ?? `ORD-${overrides.id.slice(0, 6)}`,
    status: (overrides.status as any) ?? "draft",
    shippingStatus: (overrides.shippingStatus as any) ?? "not_shipped",
    trackingCode: (overrides.trackingCode as any) ?? null,
    customerId: (overrides.customerId as any) ?? null,
    username: overrides.username ?? "khach",
    customerName: (overrides as any).customerName ?? undefined,
    avatar: (overrides as any).avatar ?? "",
    avatarUrl: (overrides as any).avatarUrl ?? "",
    customerTikTokUsername: (overrides as any).customerTikTokUsername ?? undefined,
    tiktokUsername: (overrides as any).tiktokUsername ?? undefined,
    comment: (overrides as any).comment ?? "",
    totalAmount: (overrides.totalAmount as any) ?? 100000,
    subtotalAmount: (overrides.subtotalAmount as any) ?? 100000,
    // @ts-ignore minimal product shape for getOrderTotal fallback
    products: (overrides.products as any) ?? [{ id: "p1", price: 100000, quantity: 1 }],
    depositStatus: (overrides.depositStatus as any) ?? "unpaid",
    createdAt: (overrides as any).createdAt ?? new Date().toISOString(),
  } as unknown as OrderWithTikTok;
}

describe("buildMergeGroups", () => {
  it("groups 3+2+1 by customerId correctly", () => {
    const orders: OrderWithTikTok[] = [
      mockOrder({ id: "a1", customerId: "cust-A", username: "A", totalAmount: 100000 }),
      mockOrder({ id: "a2", customerId: "cust-A", username: "A", totalAmount: 200000 }),
      mockOrder({ id: "a3", customerId: "cust-A", username: "A", totalAmount: 150000 }),
      mockOrder({ id: "b1", customerId: "cust-B", username: "B", totalAmount: 50000 }),
      mockOrder({ id: "b2", customerId: "cust-B", username: "B", totalAmount: 70000 }),
      mockOrder({ id: "c1", customerId: "cust-C", username: "C", totalAmount: 30000 }),
    ];

    const result = buildMergeGroups(orders);

    expect(result.mergeable).toHaveLength(2);
    expect(result.unmergeable).toHaveLength(1);

    // mergeable sorted by count desc then amount: 3-group first
    expect(result.mergeable[0].customerId).toBe("cust-A");
    expect(result.mergeable[0].orders).toHaveLength(3);
    expect(result.mergeable[1].customerId).toBe("cust-B");
    expect(result.mergeable[1].orders).toHaveLength(2);

    // singleton is unmergeable with reason
    expect(result.unmergeable[0].customerId).toBe("cust-C");
    expect(result.unmergeable[0].reason).toBe("Chỉ có 1 đơn nháp");

    // totals
    expect(result.mergeable[0].totalAmount).toBe(450000);
    expect(result.mergeable[1].totalAmount).toBe(120000);
  });

  it("marks groups with null customerId as unmergeable (Thiếu thông tin khách)", () => {
    const orders: OrderWithTikTok[] = [
      mockOrder({ id: "x1", customerId: null, username: "anon1" }),
      mockOrder({ id: "x2", customerId: null, username: "anon2" }),
    ];
    // different username => different fallback keys => 2 singleton groups
    const result = buildMergeGroups(orders);
    expect(result.mergeable).toHaveLength(0);
    expect(result.unmergeable.every((g) => g.reason === "Thiếu thông tin khách" || g.reason === "Chỉ có 1 đơn nháp")).toBe(true);
  });

  it("marks group with confirmed order as unmergeable (Chỉ gộp đơn nháp)", () => {
    const orders: OrderWithTikTok[] = [
      mockOrder({ id: "d1", customerId: "cust-D", status: "draft" as any }),
      mockOrder({ id: "d2", customerId: "cust-D", status: "confirmed" as any }),
    ];
    const result = buildMergeGroups(orders);
    expect(result.mergeable).toHaveLength(0);
    expect(result.unmergeable[0].reason).toBe("Chỉ gộp đơn nháp");
  });

  it("marks group with shipped order as unmergeable (Đã có vận đơn)", () => {
    const orders: OrderWithTikTok[] = [
      mockOrder({ id: "e1", customerId: "cust-E", shippingStatus: "not_shipped" as any, trackingCode: null as any }),
      mockOrder({ id: "e2", customerId: "cust-E", shippingStatus: "shipped" as any, trackingCode: "TRK123" as any }),
    ];
    const result = buildMergeGroups(orders);
    expect(result.mergeable).toHaveLength(0);
    expect(result.unmergeable[0].reason).toBe("Đã có vận đơn");
  });
});
