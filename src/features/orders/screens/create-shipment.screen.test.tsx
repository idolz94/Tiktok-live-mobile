/**
 * Integration test: CreateShipmentScreen
 *
 * Strategy: mock useCreateShipment (the single orchestrating hook) so the
 * screen renders with controlled state, then interact with the submit button.
 */
import { render, screen, fireEvent } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// ── External mocks ────────────────────────────────────────────────────────────
jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock("../hooks/use-create-shipment");
jest.mock("@hooks/use-theme", () => ({
  useThemes: () => ({
    colors: {
      primary: "#ee4d2d",
      neutral300: "#d0d5dd",
      neutral900: "#101828",
      neutral500: "#667085",
      neutral400: "#98a2b3",
      neutral100: "#f2f4f7",
      neutral50: "#f9fafb",
      white: "#ffffff",
      text: "#101828",
      border10: "rgba(0,0,0,0.1)",
    },
    textPresets: {
      fs16_500: { fontSize: 16, fontWeight: "500" },
      fs14_500: { fontSize: 14, fontWeight: "500" },
      fs14_400: { fontSize: 14, fontWeight: "400" },
      fs12_400: { fontSize: 12, fontWeight: "400" },
      fs20_600: { fontSize: 20, fontWeight: "600" },
    },
  }),
}));

jest.mock("@components/bottom-sheet/hook", () => ({
  useBottomSheet: () => ({ show: jest.fn(), hide: jest.fn() }),
}));

jest.mock("@features/orders/stores/address-page-store", () => ({
  useAddressPageStore: () => ({ setPicker: jest.fn(), setForm: jest.fn() }),
}));

// Silence icon + image renders in test
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));
jest.mock("@components/icon", () => ({ Icon: "Icon" }));
jest.mock("@components/popover", () => ({
  Popover: "Popover",
  PopoverContent: "PopoverContent",
  PopoverTrigger: "PopoverTrigger",
  PopoverProvider: ({ children }: { children: any }) => children,
}));
jest.mock("react-native-safe-area-context", () => {
  const RN = jest.requireActual("react-native");
  // ponytail: use createElement string to avoid React reference restriction in jest.mock factory
  return {
    SafeAreaProvider: "SafeAreaProvider",
    SafeAreaView: "SafeAreaView",
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    // required by the library internals
    SafeAreaInsetsContext: { Consumer: RN.View, Provider: RN.View },
  };
});

// ── Imports after mocks ───────────────────────────────────────────────────────
import { useCreateShipment } from "../hooks/use-create-shipment";
import CreateShipmentScreen from "./create-shipment";

const mockUseCreateShipment = useCreateShipment as jest.MockedFunction<
  typeof useCreateShipment
>;

// ── Fixture ───────────────────────────────────────────────────────────────────
const SENDER = { id: "s-1", name: "Lumi Store", phone: "0901234567" } as any;
const RECIPIENT = { id: "r-1", name: "Nguyễn A", phone: "0909999999" } as any;
const ORDER = { id: "order-1", totalAmount: 150000 } as any;

/** Baseline hook return — SPX provider, sender + recipient set, form filled. */
function makeHookReturn(overrides: Partial<ReturnType<typeof useCreateShipment>> = {}): ReturnType<typeof useCreateShipment> {
  return {
    order: ORDER,
    isManualProvider: false,
    isSpxProvider: true,
    isEditMode: false,
    primaryProduct: undefined as any,
    displayQuantity: 1,
    orderTotal: 150000,
    selectedSender: SENDER,
    setSelectedSender: jest.fn(),
    selectedRecipient: RECIPIENT,
    setSelectedRecipient: jest.fn(),
    reloadShopAddresses: jest.fn(),
    reloadCustomerAddresses: jest.fn(),
    shopAddresses: [],
    customerAddresses: [],
    isLoadingSender: false,
    isLoadingRecipient: false,
    // addrForm
    addrFormTarget: null,
    setAddrFormTarget: jest.fn(),
    editingAddr: null,
    setEditingAddr: jest.fn(),
    isSavingAddr: false,
    formTitle: "",
    handleAddAddress: jest.fn(),
    handleEditAddress: jest.fn(),
    handleDeleteAddress: jest.fn(),
    handleSelectRecipient: jest.fn(),
    handleSaveAddress: jest.fn(),
    // address form
    weightInput: "500",
    setWeightInput: jest.fn(),
    dimLength: "40",
    setDimLength: jest.fn(),
    dimWidth: "40",
    setDimWidth: jest.fn(),
    dimHeight: "10",
    setDimHeight: jest.fn(),
    parcelItemName: "Áo thun",
    setParcelItemName: jest.fn(),
    note: "",
    setNote: jest.fn(),
    serviceType: 1,
    setServiceType: jest.fn(),
    collectType: 2, // gửi điểm — không cần pickupTimeRangeId
    setCollectType: jest.fn(),
    pickupTimeRangeId: null,
    pickupTimeKey: null,
    pickupTimestamp: null,
    setPickupTime: jest.fn(),
    paymentSide: 0,
    setPaymentSide: jest.fn(),
    transport: "road",
    setTransport: jest.fn(),
    viewCondition: "viewable" as const,
    setViewCondition: jest.fn(),
    deliveryPolicy: "full" as const,
    setDeliveryPolicy: jest.fn(),
    refusalFee: "free" as const,
    setRefusalFee: jest.fn(),
    autoScale: false,
    setAutoScale: jest.fn(),
    pickupOption: "cod",
    setPickupOption: jest.fn(),
    declaredValue: 150000,
    setDeclaredValue: jest.fn(),
    selectedVoucherCode: null,
    setSelectedVoucherCode: jest.fn(),
    allowMutualCheck: 0 as any,
    setAllowMutualCheck: jest.fn(),
    allowTryOn: 0 as any,
    setAllowTryOn: jest.fn(),
    allowPartialDelivery: 0 as any,
    setAllowPartialDelivery: jest.fn(),
    itemPicture: null,
    setItemPicture: jest.fn(),
    manualShippingFee: "",
    setManualShippingFee: jest.fn(),
    manualCodAmount: "",
    setManualCodAmount: jest.fn(),
    manualNote: "",
    setManualNote: jest.fn(),
    idempotencyKey: "uuid-test",
    // spx
    estimatedFee: 25000,
    timeslots: [],
    timeslotsLoading: false,
    timeslotsError: null,
    vouchers: [],
    vouchersLoading: false,
    vouchersError: null,
    estimatedDelivery: null,
    feeLoading: false,
    feeError: null,
    // computed
    shippingFee: 25000,
    codAmount: 150000,
    codAmountDisplay: "150.000",
    goodsValueDisplay: "150.000",
    voucherAmount: 0,
    totalCollected: 175000,
    // submit
    isSubmitting: false,
    submitState: "idle" as const,
    handleSubmitShipment: jest.fn(),
    handleRetryOutcomeUnknown: jest.fn(),
    ...overrides,
  };
}

// ponytail: render() is async in RNTL v14 — must await
async function renderScreen(hookReturn = makeHookReturn()) {
  mockUseCreateShipment.mockReturnValue(hookReturn);
  return render(
    <SafeAreaProvider>
      <CreateShipmentScreen />
    </SafeAreaProvider>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("CreateShipmentScreen — integration", () => {
  beforeEach(() => jest.clearAllMocks());

  it("hiển thị nút 'Tạo vận đơn'", async () => {
    await renderScreen();
    expect(screen.getByText("Tạo vận đơn")).toBeTruthy();
  });

  it("nút enabled khi có sender, recipient, parcelItemName, weight", async () => {
    await renderScreen();
    // Tìm Pressable submit — đi lên 2 cấp từ Text "Tạo vận đơn" (Text → View → Pressable)
    const btn = screen.getByText("Tạo vận đơn").parent?.parent;
    expect(btn?.props.disabled).toBeFalsy();
  });

  it("bấm submit → gọi handleSubmitShipment", async () => {
    const handleSubmitShipment = jest.fn();
    await renderScreen(makeHookReturn({ handleSubmitShipment }));
    fireEvent.press(screen.getByText("Tạo vận đơn"));
    expect(handleSubmitShipment).toHaveBeenCalledTimes(1);
  });

  it("nút disabled khi không có sender — bấm không gọi submit", async () => {
    const handleSubmitShipment = jest.fn();
    await renderScreen(makeHookReturn({ selectedSender: null, handleSubmitShipment }));
    fireEvent.press(screen.getByText("Tạo vận đơn"));
    expect(handleSubmitShipment).not.toHaveBeenCalled();
  });

  it("nút disabled khi không có recipient — bấm không gọi submit", async () => {
    const handleSubmitShipment = jest.fn();
    await renderScreen(makeHookReturn({ selectedRecipient: null, handleSubmitShipment }));
    fireEvent.press(screen.getByText("Tạo vận đơn"));
    expect(handleSubmitShipment).not.toHaveBeenCalled();
  });

  it("nút disabled khi SPX + weightInput rỗng — bấm không gọi submit", async () => {
    const handleSubmitShipment = jest.fn();
    await renderScreen(makeHookReturn({ isSpxProvider: true, weightInput: "", handleSubmitShipment }));
    fireEvent.press(screen.getByText("Tạo vận đơn"));
    expect(handleSubmitShipment).not.toHaveBeenCalled();
  });

  it("nút disabled khi SPX + collectType=1 + không có pickupTimeRangeId — bấm không gọi submit", async () => {
    const handleSubmitShipment = jest.fn();
    await renderScreen(
      makeHookReturn({ isSpxProvider: true, collectType: 1, pickupTimeRangeId: null, handleSubmitShipment }),
    );
    fireEvent.press(screen.getByText("Tạo vận đơn"));
    expect(handleSubmitShipment).not.toHaveBeenCalled();
  });

  it("hiển thị banner outcome_unknown khi submitState = outcome_unknown", async () => {
    await renderScreen(makeHookReturn({ submitState: "outcome_unknown" as const }));
    // "Thử lại" là text trên Pressable button trong banner
    expect(screen.getByText("Thử lại")).toBeTruthy();
  });

  it("bấm thử lại trong banner → gọi handleRetryOutcomeUnknown", async () => {
    const handleRetryOutcomeUnknown = jest.fn();
    await renderScreen(
      makeHookReturn({
        submitState: "outcome_unknown" as const,
        handleRetryOutcomeUnknown,
      }),
    );
    fireEvent.press(screen.getByText("Thử lại"));
    expect(handleRetryOutcomeUnknown).toHaveBeenCalledTimes(1);
  });
});
