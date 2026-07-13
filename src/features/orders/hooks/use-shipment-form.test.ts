import { renderHook, act } from "@testing-library/react-native";
import { useShipmentForm } from "./use-shipment-form";

const baseParams = { order: null, orderTotal: 0 };

async function hook(params: Parameters<typeof useShipmentForm>[0] = baseParams) {
  const rendered = await renderHook(() => useShipmentForm(params));
  return rendered.result;
}

describe("useShipmentForm", () => {
  describe("defaults", () => {
    it("weightInput mặc định là 500", async () => {
      const result = await hook();
      expect(result.current.weightInput).toBe("500");
    });

    it("kích thước mặc định 40×40×10", async () => {
      const result = await hook();
      expect(result.current.dimLength).toBe("40");
      expect(result.current.dimWidth).toBe("40");
      expect(result.current.dimHeight).toBe("10");
    });

    it("parcelItemName lấy từ primaryProductName", async () => {
      const result = await hook({ ...baseParams, primaryProductName: "Áo thun" });
      expect(result.current.parcelItemName).toBe("Áo thun");
    });
  });

  describe("weightInput - cập nhật và parse", () => {
    it("setWeightInput cập nhật giá trị", async () => {
      const result = await hook();
      await act(async () => { result.current.setWeightInput("1200"); });
      expect(result.current.weightInput).toBe("1200");
    });

    it("parse số hợp lệ thành gram đúng", async () => {
      const result = await hook();
      await act(async () => { result.current.setWeightInput("1500"); });
      const gram = parseInt(result.current.weightInput.replace(/\D/g, ""), 10) || undefined;
      expect(gram).toBe(1500);
    });

    it("input có chữ (500g) parse thành 500", async () => {
      const result = await hook();
      await act(async () => { result.current.setWeightInput("500g"); });
      const gram = parseInt(result.current.weightInput.replace(/\D/g, ""), 10) || undefined;
      expect(gram).toBe(500);
    });

    it("input rỗng parse thành undefined (block submit SPX)", async () => {
      const result = await hook();
      await act(async () => { result.current.setWeightInput(""); });
      const gram = parseInt(result.current.weightInput.replace(/\D/g, ""), 10) || undefined;
      expect(gram).toBeUndefined();
    });

    it("input '0' parse thành undefined (block submit SPX)", async () => {
      const result = await hook();
      await act(async () => { result.current.setWeightInput("0"); });
      const gram = parseInt(result.current.weightInput.replace(/\D/g, ""), 10) || undefined;
      expect(gram).toBeUndefined();
    });

    it("input chỉ có ký tự đặc biệt parse thành undefined", async () => {
      const result = await hook();
      await act(async () => { result.current.setWeightInput("!!!"); });
      const gram = parseInt(result.current.weightInput.replace(/\D/g, ""), 10) || undefined;
      expect(gram).toBeUndefined();
    });
  });

  describe("serviceType reset pickup time", () => {
    it("đổi serviceType reset pickupTimeRangeId về null", async () => {
      const result = await hook();
      await act(async () => { result.current.setPickupTime(5, "key-1", 1700000000); });
      expect(result.current.pickupTimeRangeId).toBe(5);

      await act(async () => { result.current.setServiceType(2); });
      expect(result.current.pickupTimeRangeId).toBeNull();
      expect(result.current.pickupTimeKey).toBeNull();
      expect(result.current.pickupTimestamp).toBeNull();
    });
  });
});
