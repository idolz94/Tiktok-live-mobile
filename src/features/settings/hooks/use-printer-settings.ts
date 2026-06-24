import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { ThermalPrinter } from "@finan-me/react-native-thermal-printer";
import { usePrinterStore } from "../stores/printer-store";
import type { PrinterConfig, PrinterConnectionType, PrinterPaperSize, PrinterFontSize } from "../types/printer";

function buildPrinterAddress(config: PrinterConfig): string {
  if (config.connectionType === "bluetooth") {
    return `bt:${config.macAddress}`;
  }
  return `lan:${config.ipAddress}:9100`;
}

function buildPaperWidthMm(paperSize: PrinterPaperSize): number {
  return paperSize === "58mm" ? 58 : 80;
}

function buildFontSize(fontSize: PrinterFontSize): 1 | 2 | 3 {
  if (fontSize === "small") return 1;
  if (fontSize === "large") return 3;
  return 2;
}

export function usePrinterSettings() {
  const { config, setConfig } = usePrinterStore();
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleTestPrint = useCallback(async () => {
    const address = buildPrinterAddress(config);

    if (config.connectionType === "wifi" && !config.ipAddress) {
      Alert.alert("Chưa cấu hình máy in", "Vui lòng nhập địa chỉ IP máy in trước khi in thử.");
      return;
    }
    if (config.connectionType === "bluetooth" && !config.macAddress) {
      Alert.alert("Chưa cấu hình máy in", "Vui lòng chọn máy in Bluetooth trước khi in thử.");
      return;
    }

    setIsTesting(true);
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

  const handleTestConnection = useCallback(async (): Promise<boolean> => {
    const address = buildPrinterAddress(config);
    try {
      const result = await ThermalPrinter.testConnection(address);
      return result.success;
    } catch {
      return false;
    }
  }, [config]);

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

  return {
    config,
    isSaving,
    isTesting,
    handleSave,
    handleTestPrint,
    handleTestConnection,
    setConnectionType,
    setIpAddress,
    setMacAddress,
    setPaperSize,
    setFontSize,
  };
}
