import { normalizeApiOrderForUi } from "./order";

describe("normalizeApiOrderForUi", () => {
  it("recomputes zero order totals from products", () => {
    const order = normalizeApiOrderForUi({
      id: "order-1",
      orderCode: "578450",
      subtotalAmount: 0,
      totalAmount: 0,
      codAmount: 0,
      products: [
        { id: "item-1", productName: "Mã 3 đi shop", price: 20000, quantity: 6 },
      ],
    });

    expect(order.products[0]?.name).toBe("Mã 3 đi shop");
    expect(order.subtotalAmount).toBe(120000);
    expect(order.totalAmount).toBe(120000);
    expect(order.codAmount).toBe(120000);
  });
});
