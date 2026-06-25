import {
  PRINTER_CONNECTION_LABELS,
  PRINTER_FONT_SIZE_LABELS,
  PRINTER_PAPER_SIZE_LABELS,
  type PrinterConnectionType,
  type PrinterFontSize,
  type PrinterPaperSize,
} from "../../types/printer";

export const PRINTER_CONNECTION_OPTIONS: { value: PrinterConnectionType; label: string }[] = [
  { value: "wifi", label: PRINTER_CONNECTION_LABELS.wifi },
  { value: "bluetooth", label: PRINTER_CONNECTION_LABELS.bluetooth },
];

export const PRINTER_PAPER_OPTIONS: { value: PrinterPaperSize; label: string }[] = [
  { value: "58mm", label: PRINTER_PAPER_SIZE_LABELS["58mm"] },
  { value: "80mm", label: PRINTER_PAPER_SIZE_LABELS["80mm"] },
];

export const PRINTER_FONT_OPTIONS: { value: PrinterFontSize; label: string }[] = [
  { value: "small", label: PRINTER_FONT_SIZE_LABELS.small },
  { value: "medium", label: PRINTER_FONT_SIZE_LABELS.medium },
  { value: "large", label: PRINTER_FONT_SIZE_LABELS.large },
];
