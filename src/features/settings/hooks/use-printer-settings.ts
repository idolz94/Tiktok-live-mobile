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
  const [isSaving, setIsSaving] = useState(false);
  const [connectionState, setConnectionState] = useState<PrinterConnectionState>("idle");

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
        }

        if (state === "disconnected") {
          const wasConnected = wasConnectedRef.current;
          wasConnectedRef.current = false;
          setConnectionState("disconnected");

          // Only alert on unexpected disconnect (not manual disconnect)
          if (wasConnected) {
            const msg = reason ? `Lý do: ${reason}` : "Vui lòng kiểm tra lại máy in.";
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

    setConnectionState("connecting");
    const address = buildPrinterAddress(config);

    try {
      const result = await ThermalPrinter.testConnection(address);

      if (result.success) {
        wasConnectedRef.current = true;
        setConnectionState("connected");
        const deviceLabel = result.deviceName ?? address;
        Alert.alert("Kết nối thành công", `Đã kết nối với ${deviceLabel}.`);
      } else {
        setConnectionState("disconnected");
        const msg = result.error?.message ?? "Không thể kết nối máy in.";
        Alert.alert("Kết nối thất bại", msg);
      }
    } catch (e: unknown) {
      setConnectionState("disconnected");
      const msg = e instanceof Error ? e.message : "Không thể kết nối máy in.";
      Alert.alert("Kết nối thất bại", msg);
    }
  }, [config]);

  // ─── Disconnect ─────────────────────────────────────────────────────────────

  const handleDisconnect = useCallback(async () => {
    const address = buildPrinterAddress(config);
    // Mark as not connected before calling native so the event listener
    // does not fire a "disconnected" Alert (user initiated this).
    wasConnectedRef.current = false;
    setConnectionState("idle");

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
            { type: "text", content: "--- In thử ---", style: { align: "center", bold: true, size: buildFontSize(config.fontSize) } },
            { type: "feed", lines: 1 },
            { type: "text", content: "Lumi Live", style: { align: "center", size: buildFontSize(config.fontSize) } },
            { type: "text", content: `Khổ giấy: ${config.paperSize}`, style: { align: "center" } },
            { type: "text", content: `Kết nối: ${config.connectionType === "wifi" ? "LAN/WiFi" : "Bluetooth"}`, style: { align: "center" } },
            { type: "feed", lines: 1 },
            { type: "text", content: "Máy in hoạt động bình thường", style: { align: "center" } },
            { type: "feed", lines: 2 },
            { type: "cut" },
          ],
        ],
      });

      const printerResult = result.results.get(address);
      if (printerResult?.success) {
        Alert.alert("In thử thành công", "Máy in đang hoạt động bình thường.");
      } else {
        const msg = printerResult?.error?.message ?? "Không thể kết nối máy in.";
        Alert.alert("In thử thất bại", msg);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Không thể kết nối máy in.";
      Alert.alert("In thử thất bại", msg);
    } finally {
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
