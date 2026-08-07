import { addrSchema } from "./shipment-schema";

const VALID_ADDRESS = {
  label: "",
  name: "Nguyễn Minh Hoàng",
  phone: "0942026267",
  province: "Thành phố Hà Nội",
  ward: "Phường Cầu Giấy",
  address: "12 Xuân Thủy",
  isDefault: false,
};

describe("addrSchema", () => {
  it("bắt buộc địa chỉ chi tiết", () => {
    const result = addrSchema.safeParse({
      ...VALID_ADDRESS,
      address: "  ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["address"],
            message: "Vui lòng nhập địa chỉ chi tiết",
          }),
        ]),
      );
    }
  });
});
