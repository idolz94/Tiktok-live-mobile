import { renderHook, act } from "@testing-library/react-native";
import { router } from "expo-router";
import { useSubmitShipment } from "./use-submit-shipment";
import { submitSpxApi, submitManualShippingApi, updateSpxApi } from "../service/create-shipment-api";

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));
jest.mock("../service/create-shipment-api", () => ({
  submitSpxApi: jest.fn(),
  updateSpxApi: jest.fn(),
  submitManualShippingApi: jest.fn(),
}));

const mockToastWarning = jest.fn();
const mockToastError = jest.fn();

jest.mock("@components/toast", () => ({
  useToast: () => ({ warning: mockToastWarning, error: mockToastError }),
}));

const mockSubmitSpx = submitSpxApi as jest.MockedFunction<typeof submitSpxApi>;
const mockUpdateSpx = updateSpxApi as jest.MockedFunction<typeof updateSpxApi>;
const mockSubmitManual = submitManualShippingApi as jest.MockedFunction<typeof submitManualShippingApi>;
const mockRouterReplace = router.replace as jest.Mock;

const SENDER = {
  id: "sender-1", shopId: "shop-1", label: "Shop", name: "Lumi Store",
  province: "HCM", district: "Q1", ward: "P1", address: "123 ABC",
  phone: "0901234567", isDefault: true, createdAt: "", updatedAt: "",
} as any;

const RECIPIENT = {
  id: "recipient-1", customerId: "cust-1", label: null, name: "Nguyễn A",
  phone: "0909999999", address: "456 XYZ", province: "HN", district: "HK",
  ward: "P2", isDefault: true, createdAt: "", updatedAt: "",
} as any;

const ORDER = { id: "order-abc", codAmount: 150000, totalAmount: 150000 } as any;

const spxDeps = (overrides = {}) => ({
  order: ORDER, isManualProvider: false, isSpxProvider: true, isEditMode: false,
  selectedSender: SENDER, selectedRecipient: RECIPIENT,
  paymentSide: 0 as const, transport: "road" as const, pickupOption: "cod" as const,
  note: "", manualShippingFee: "", manualCodAmount: "", manualNote: "", manualFee: 0,
  senderAddressId: "addr-sender-1", serviceType: 1 as const, collectType: 1 as const,
  pickupTimeRangeId: 3, pickupTime: 1700000000, parcelItemName: "Áo thun",
  weightGram: 500, idempotencyKey: "uuid-test-123",
  codAmount: 150000, shippingFee: 25000, voucherAmount: 0,
  ...overrides,
});

async function hook(deps: ReturnType<typeof spxDeps>) {
  const rendered = await renderHook(() => useSubmitShipment(deps));
  return rendered.result;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useSubmitShipment — SPX flow", () => {
  it("submit thành công: gọi API và redirect success", async () => {
    mockSubmitSpx.mockResolvedValueOnce({ shipping: {} } as any);

    const result = await hook(spxDeps());
    await act(async () => { await result.current.handleSubmitShipment(); });

    expect(mockSubmitSpx).toHaveBeenCalledTimes(1);
    expect(mockSubmitSpx).toHaveBeenCalledWith(
      "order-abc",
      expect.objectContaining({ parcelWeightGram: 500, serviceType: 1, collectType: 1 }),
    );
    expect(mockRouterReplace).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: expect.stringContaining("success") }),
    );
    expect(result.current.submitState).toBe("success");
  });

  it("weightGram undefined (cân nặng rỗng): block, Alert thiếu thông tin", async () => {
    const result = await hook(spxDeps({ weightGram: undefined }));
    await act(async () => { await result.current.handleSubmitShipment(); });

    expect(mockSubmitSpx).not.toHaveBeenCalled();
    expect(mockToastWarning).toHaveBeenCalledWith({ title: "Thiếu thông tin", description: expect.any(String) });
    expect(result.current.submitState).toBe("idle");
  });

  it("collectType=1 không có pickupTimeRangeId: block, Alert chọn khung giờ", async () => {
    const result = await hook(spxDeps({ collectType: 1, pickupTimeRangeId: undefined }));
    await act(async () => { await result.current.handleSubmitShipment(); });

    expect(mockSubmitSpx).not.toHaveBeenCalled();
    expect(mockToastWarning).toHaveBeenCalledWith({ title: "Thiếu thông tin", description: "Vui lòng chọn khung giờ lấy hàng." });
  });

  it("collectType=2 (gửi điểm) không cần pickupTimeRangeId: submit thành công", async () => {
    mockSubmitSpx.mockResolvedValueOnce({ shipping: {} } as any);

    const result = await hook(spxDeps({ collectType: 2, pickupTimeRangeId: undefined }));
    await act(async () => { await result.current.handleSubmitShipment(); });

    expect(mockSubmitSpx).toHaveBeenCalledTimes(1);
  });

  it("edit mode: gọi update SPX và không gửi declaredValue", async () => {
    mockUpdateSpx.mockResolvedValueOnce({ shipping: {} } as any);

    const result = await hook(spxDeps({ isEditMode: true, declaredValue: 150000 }));
    await act(async () => { await result.current.handleSubmitShipment(); });

    expect(mockSubmitSpx).not.toHaveBeenCalled();
    expect(mockUpdateSpx).toHaveBeenCalledWith(
      "order-abc",
      expect.not.objectContaining({ declaredValue: expect.anything() }),
    );
  });

  it("không có sender: block, Alert thiếu thông tin", async () => {
    const result = await hook(spxDeps({ selectedSender: null }));
    await act(async () => { await result.current.handleSubmitShipment(); });

    expect(mockSubmitSpx).not.toHaveBeenCalled();
    expect(mockToastWarning).toHaveBeenCalledWith({ title: "Thiếu thông tin", description: expect.any(String) });
  });

  it("API lỗi network: state = outcome_unknown", async () => {
    const err = new Error("Network Error");
    mockSubmitSpx.mockRejectedValueOnce(err);

    const result = await hook(spxDeps());
    await act(async () => { await result.current.handleSubmitShipment(); });

    expect(result.current.submitState).toBe("outcome_unknown");
  });

  it("API lỗi thường: state trở về idle, Alert thất bại", async () => {
    const err: any = new Error("400 Bad Request");
    err.response = { status: 400 };
    mockSubmitSpx.mockRejectedValueOnce(err);

    const result = await hook(spxDeps());
    await act(async () => { await result.current.handleSubmitShipment(); });

    expect(result.current.submitState).toBe("idle");
    expect(mockToastError).toHaveBeenCalledWith({ title: "Tạo vận đơn thất bại", description: expect.any(String) });
  });
});

describe("useSubmitShipment — Manual flow", () => {
  const manualDeps = (overrides = {}) => ({
    ...spxDeps(),
    isSpxProvider: false,
    isManualProvider: true,
    manualShippingFee: "30.000",
    manualCodAmount: "150.000",
    manualFee: 30000,
    ...overrides,
  });

  it("submit manual thành công: gọi submitManualShippingApi và redirect", async () => {
    mockSubmitManual.mockResolvedValueOnce({ shipping: {} } as any);

    const result = await hook(manualDeps());
    await act(async () => { await result.current.handleSubmitShipment(); });

    expect(mockSubmitManual).toHaveBeenCalledTimes(1);
    expect(mockRouterReplace).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: expect.stringContaining("success") }),
    );
    expect(result.current.submitState).toBe("success");
  });
});
