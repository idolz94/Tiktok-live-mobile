import { useState, useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { ThermalPrinter } from "@finan-me/react-native-thermal-printer";
import { usePrinterStore } from "../stores/printer-store";
import type {
  PrinterConfig,
  PrinterConnectionType,
  PrinterPaperSize,
  PrinterFontSize,
  PrinterConnectionState,
} from "../types/printer";

export type { PrinterConnectionState };

// ─── Address helpers ──────────────────────────────────────────────────────────

function buildPrinterAddress(config: PrinterConfig): string {
  if (config.connectionType === "bluetooth") {
    return `bt:${config.macAddress}`;
  }
  return `lan:${config.ipAddress}:9100`;
}

function hasValidAddress(config: PrinterConfig): boolean {
  if (config.connectionType === "wifi") return !!config.ipAddress;
  return !!config.macAddress;
}

// ─── Print helpers ────────────────────────────────────────────────────────────

function buildPaperWidthMm(paperSize: PrinterPaperSize): number {
  return paperSize === "58mm" ? 58 : 80;
}

function buildFontSize(fontSize: PrinterFontSize): 1 | 2 | 3 {
  if (fontSize === "small") return 1;
  if (fontSize === "large") return 3;
  return 2;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePrinterSettings() {
  const { config, setConfig } = usePrinterStore();
  const [isTesting, setIsTesting] = useState(false);
  const isTestingPrintRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionState, setConnectionState] =
    useState<PrinterConnectionState>("idle");
  const [connectedDevice, setConnectedDevice] = useState<{
    name: string;
    type?: string;
  } | null>(null);

  // Track whether the printer was connected so we can detect unexpected disconnects
  const wasConnectedRef = useRef(false);

  // ─── Connection event listener ──────────────────────────────────────────────
  // Subscribe to native connection state changes for the current printer address.
  // Fires Alert on unexpected disconnect (not triggered by handleDisconnect).
  // Re-subscribes whenever the address changes (config dependency).
  useEffect(() => {
    if (!hasValidAddress(config)) return;

    const subscription = ThermalPrinter.addConnectionEventListener(
      "EVENT_CONNECTION_STATE_CHANGED",
      ({ state, reason }) => {
        if (state === "connected") {
          wasConnectedRef.current = true;
          setConnectionState("connected");
          setConnectedDevice((prev) => prev || {
            name: config.connectionType === "bluetooth" ? "Máy in Bluetooth" : "Máy in LAN / WiFi",
          });
        }

        if (state === "disconnected") {
          const wasConnected = wasConnectedRef.current;
          wasConnectedRef.current = false;
          setConnectionState("disconnected");
          setConnectedDevice(null);

          // Only alert on unexpected disconnect (not manual disconnect)
          if (wasConnected) {
            const msg = reason
              ? `Lý do: ${reason}`
              : "Vui lòng kiểm tra lại máy in.";
            Alert.alert("Máy in đã ngắt kết nối", msg);
          }
        }
      },
    );

    return () => {
      ThermalPrinter.removeConnectionEventListener(subscription);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.connectionType, config.ipAddress, config.macAddress]);

  // ─── Reset state when address changes ──────────────────────────────────────
  // Prevent stale "connected" badge when user switches to a different printer.
  useEffect(() => {
    wasConnectedRef.current = false;
    setConnectionState("idle");
    setConnectedDevice(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.connectionType, config.ipAddress, config.macAddress]);

  // ─── Connect ────────────────────────────────────────────────────────────────

  const handleConnect = useCallback(async () => {
    if (!hasValidAddress(config)) {
      const msg =
        config.connectionType === "wifi"
          ? "Vui lòng nhập địa chỉ IP máy in trước khi kết nối."
          : "Vui lòng chọn máy in Bluetooth trước khi kết nối.";
      Alert.alert("Chưa cấu hình máy in", msg);
      return;
    }

    if (isTestingPrintRef.current) return;
    isTestingPrintRef.current = true;

    setConnectionState("connecting");
    const address = buildPrinterAddress(config);

    try {
      const result = await ThermalPrinter.testConnection(address);

      if (result.success) {
        wasConnectedRef.current = true;
        setConnectionState("connected");
        const fallbackName = config.connectionType === "bluetooth" ? "Máy in Bluetooth" : "Máy in LAN / WiFi";
        const deviceName = result.deviceName || fallbackName;
        setConnectedDevice({
          name: deviceName,
          type: result.deviceType,
        });
        Alert.alert("Kết nối thành công", `Đã kết nối với ${deviceName}.`);
      } else {
        setConnectionState("disconnected");
        setConnectedDevice(null);
        const msg = result.error?.message ?? "Không thể kết nối máy in.";
        Alert.alert("Kết nối thất bại", msg);
      }
    } catch (e: unknown) {
      setConnectionState("disconnected");
      setConnectedDevice(null);
      const msg = e instanceof Error ? e.message : "Không thể kết nối máy in.";
      Alert.alert("Kết nối thất bại", msg);
    } finally {
      isTestingPrintRef.current = false;
      setIsTesting(false);
    }
  }, [config]);

  // ─── Disconnect ─────────────────────────────────────────────────────────────

  const handleDisconnect = useCallback(async () => {
    const address = buildPrinterAddress(config);
    // Mark as not connected before calling native so the event listener
    // does not fire a "disconnected" Alert (user initiated this).
    wasConnectedRef.current = false;
    setConnectionState("idle");
    setConnectedDevice(null);

    try {
      await ThermalPrinter.disconnect(address);
    } catch {
      // Disconnect errors are non-critical — state is already reset
    }
  }, [config]);

  // ─── Test print ─────────────────────────────────────────────────────────────

  const handleTestPrint = useCallback(async () => {
    if (!hasValidAddress(config)) {
      const msg =
        config.connectionType === "wifi"
          ? "Vui lòng nhập địa chỉ IP máy in trước khi in thử."
          : "Vui lòng chọn máy in Bluetooth trước khi in thử.";
      Alert.alert("Chưa cấu hình máy in", msg);
      return;
    }

    if (isTestingPrintRef.current) return;
    isTestingPrintRef.current = true;
    setIsTesting(true);
    const address = buildPrinterAddress(config);

    try {
      const result = await ThermalPrinter.printReceipt({
        printers: [
          {
            address,
            options: {
              encoding: "utf8",
              paperWidthMm: buildPaperWidthMm(config.paperSize),
            },
          },
        ],
        documents: [
          [
            // 1. TOP HEADER (Website & Phone number)
            {
              type: "columns",
              columns: [
                { content: "HTTPS://LUMILIVE.VN/", width: 50, align: "left" },
                { content: config.userPhone || "+84 912 345 678", width: 50, align: "right" },
              ],
            },
            { type: "feed", lines: 1 },

            // 2. COMPANY NAME & ADDRESS
            {
              type: "text",
              content: config.companyName || "CÔNG TY ABC",
              style: {
                align: "center",
                bold: true,
                size: 2,
              },
            },
            {
              type: "text",
              content: config.companyAddress || "123 ĐƯỜNG ABC, THÀNH PHỐ DEF",
              style: { align: "center" },
            },
            { type: "feed", lines: 1 },
            { type: "line" },

            // 3. CUSTOMER & INVOICE INFO
            {
              type: "columns",
              columns: [
                {
                  content: `${config.tiktokUsername || "ANH A"}\n${config.userPhone || "+84 912 345 678"}\n${config.userAddress || "Số 123 Đường ABC,\nThành phố DEF"}`,
                  width: 55,
                  align: "left",
                },
                {
                  content: `Hóa đơn số ${config.recordNumb || 12345}\nNgày 19/06/2026`,
                  width: 45,
                  align: "right",
                },
              ],
            },
            { type: "feed", lines: 1 },
            { type: "line" },

            // 4. ITEMS TABLE
            {
              type: "table",
              headers: ["Hạng mục", "Số lượng", "Đơn giá", "Thành tiền"],
              rows: [
                ["A1", "1", "3.000.000đ", "3.000.000đ"],
                ["A2", "2", "3.000.000đ", "6.000.000đ"],
                ["A6", "1", "3.000.000đ", "3.000.000đ"],
              ],
              columnWidths: [35, 15, 25, 25],
              alignments: ["left", "center", "right", "right"],
            },
            { type: "line" },

            // 5. SUMMARY
            {
              type: "columns",
              columns: [
                { content: "", width: 50 },
                { content: "Tổng", width: 20, align: "left" },
                { content: "12.000.000đ", width: 30, align: "right" },
              ],
            },
            {
              type: "columns",
              columns: [
                { content: "", width: 50 },
                { content: "Thuế (0%)", width: 20, align: "left" },
                { content: "0đ", width: 30, align: "right" },
              ],
            },
            { type: "line" },
            {
              type: "columns",
              columns: [
                { content: "", width: 50 },
                { content: "Tổng cộng", width: 22, align: "left", style: { bold: true } },
                { content: "12.000.000đ", width: 28, align: "right", style: { bold: true } },
              ],
            },
            { type: "line" },
            { type: "feed", lines: 1 },

            // 6. BOTTOM PAYMENT INFO & THANK YOU
            {
              type: "columns",
              columns: [
                {
                  content: "Thông tin thanh toán\nNgân hàng ABC\nTên tài khoản: A\nSố tài khoản: 123456789\nThanh toán ngày: 19/06/2026",
                  width: 60,
                  align: "left",
                },
                {
                  content: `\n\n${config.tiktokUsername || "ABC"}\nXIN CẢM ƠN`,
                  width: 40,
                  align: "right",
                  style: { bold: true },
                },
              ],
            },
            { type: "feed", lines: 3 },
            { type: "cut" },
          ],
        ],
      });

      const printerResult = result.results.get(address);
      if (printerResult?.success) {
        Alert.alert("In thử thành công", "Máy in đang hoạt động bình thường.");
      } else {
        const msg =
          printerResult?.error?.message ?? "Không thể kết nối máy in.";
        Alert.alert("In thử thất bại", msg);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Không thể kết nối máy in.";
      Alert.alert("In thử thất bại", msg);
    } finally {
      isTestingPrintRef.current = false;
      setIsTesting(false);
    }
  }, [config]);

  // ─── Config setters ──────────────────────────────────────────────────────────

  const handleSave = useCallback(
    async (values: Partial<PrinterConfig>) => {
      setIsSaving(true);
      try {
        setConfig(values);
      } finally {
        setIsSaving(false);
      }
    },
    [setConfig],
  );

  const setConnectionType = useCallback(
    (connectionType: PrinterConnectionType) => setConfig({ connectionType }),
    [setConfig],
  );

  const setIpAddress = useCallback(
    (ipAddress: string) => setConfig({ ipAddress }),
    [setConfig],
  );

  const setMacAddress = useCallback(
    (macAddress: string) => setConfig({ macAddress }),
    [setConfig],
  );

  const setPaperSize = useCallback(
    (paperSize: PrinterPaperSize) => setConfig({ paperSize }),
    [setConfig],
  );

  const setFontSize = useCallback(
    (fontSize: PrinterFontSize) => setConfig({ fontSize }),
    [setConfig],
  );

  // ─── Return ──────────────────────────────────────────────────────────────────

  return {
    config,
    connectionState,
    connectedDevice,
    isSaving,
    isTesting,
    handleSave,
    handleConnect,
    handleDisconnect,
    handleTestPrint,
    setConnectionType,
    setIpAddress,
    setMacAddress,
    setPaperSize,
    setFontSize,
  };
}
