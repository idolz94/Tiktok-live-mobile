export type PrinterConnectionType = "wifi" | "bluetooth";

export type PrinterPaperSize = "58mm" | "80mm";

export type PrinterFontSize = "small" | "medium" | "large";

export type PrinterConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected";

export type PrinterSheet = "connection" | "paper" | "font";

export type PrinterConfig = {
  connectionType: PrinterConnectionType;
  /** IP address for WiFi printers */
  ipAddress: string;
  /** MAC address for Bluetooth printers */
  macAddress: string;
  paperSize: PrinterPaperSize;
  fontSize: PrinterFontSize;

  /** Cấu hình nội dung in */
  companyName?: string;
  companyAddress?: string;
  tiktokUsername?: string;
  userPhone?: string;
  userAddress?: string;
  recordNumb?: number;
};

export const DEFAULT_PRINTER_CONFIG: PrinterConfig = {
  connectionType: "wifi",
  ipAddress: "",
  macAddress: "",
  paperSize: "80mm",
  fontSize: "medium",
  companyName: "CÔNG TY ABC",
  companyAddress: "123 ĐƯỜNG ABC, THÀNH PHỐ DEF",
  tiktokUsername: "ABC",
  userPhone: "+84 912 345 678",
  userAddress: "Số 123 Đường ABC, Thành phố DEF",
  recordNumb: 12345,
};

export const PRINTER_CONNECTION_LABELS: Record<PrinterConnectionType, string> =
  {
    wifi: "LAN / WiFi",
    bluetooth: "Bluetooth",
  };

export const PRINTER_PAPER_SIZE_LABELS: Record<PrinterPaperSize, string> = {
  "58mm": "58mm",
  "80mm": "80mm",
};

export const PRINTER_FONT_SIZE_LABELS: Record<PrinterFontSize, string> = {
  small: "Nhỏ",
  medium: "Vừa",
  large: "Lớn",
};

export const PRINTER_CONNECTION_STATE_LABELS: Record<
  PrinterConnectionState,
  string
> = {
  idle: "Chưa kết nối",
  connecting: "Đang kết nối...",
  connected: "Đã kết nối",
  disconnected: "Mất kết nối",
};
