import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { ThermalPrinter } from "@finan-me/react-native-thermal-printer";
import { usePrinterStore } from "@features/settings/stores/printer-store";
import { getProductTotal, formatMoneyFull } from "@features/orders/utils/order";
import type { ShippingOrder } from "./use-shipping-tab";

// ─── Helpers (private — mirror use-printer-settings.ts) ──────────────────────

function buildAddress(connectionType: string, ip?: string, mac?: string) {
  if (connectionType === "bluetooth") return `bt:${mac ?? ""}`;
  return `lan:${ip ?? ""}:9100`;
}

function paperWidthMm(size: string) {
  return size === "58mm" ? 58 : 80;
}

// ─── Document builder ─────────────────────────────────────────────────────────

function buildLabelDocument(order: ShippingOrder, shopName: string) {
  const recipientName = order.customerName || "Khách hàng";
  const recipientPhone = order.customerPhone || "";
  const addressParts = [
    order.customerAddressData?.address,
    order.customerAddressData?.ward,
    order.customerAddressData?.district,
    order.customerAddressData?.province,
  ].filter(Boolean);
  const recipientAddress = addressParts.length ? addressParts.join(", ") : (order.customerAddress || "");
  const displayCode = order.trackingCode || order.orderCode || order.id.slice(0, 8);

  const productRows = (order.products ?? []).map((p) => {
    const name = p.name || p.code || "Sản phẩm";
    const qty = String(p.quantity);
    // ponytail: price is already in đồng — no conversion needed
    const price = formatMoneyFull(getProductTotal(p));
    return [name, qty, price];
  });

  const subtotal = (order.products ?? []).reduce((s, p) => s + getProductTotal(p), 0);
  const cod = order.codAmount != null && order.codAmount > 0
    ? order.codAmount
    : subtotal;
  const shippingFee = order.shippingFee ?? 0;

  return [
    { type: "text", content: shopName || "CỬA HÀNG", style: { align: "center", bold: true, size: 2 as const } },
    { type: "line" as const },

    { type: "columns" as const, columns: [
      { content: "Mã đơn:", width: 30, align: "left" as const },
      { content: displayCode, width: 70, align: "right" as const },
    ]},
    { type: "feed", lines: 1 },

    { type: "text", content: "NGƯỜI NHẬN:", style: { bold: true } },
    { type: "text", content: recipientName },
    ...(recipientPhone ? [{ type: "text", content: recipientPhone }] : []),
    ...(recipientAddress ? [{ type: "text", content: recipientAddress }] : []),
    { type: "line" as const },

    ...(productRows.length ? [
      { type: "table" as const,
        headers: ["Sản phẩm", "SL", "Thành tiền"],
        rows: productRows,
        columnWidths: [50, 10, 40],
        alignments: ["left", "center", "right"] as const,
      },
      { type: "line" as const },
    ] : []),

    ...(shippingFee > 0 ? [{ type: "columns" as const, columns: [
      { content: "Phí vận chuyển:", width: 60, align: "left" as const },
      { content: formatMoneyFull(shippingFee), width: 40, align: "right" as const },
    ]}] : []),

    { type: "columns" as const, columns: [
      { content: "Tiền thu hộ (COD):", width: 60, align: "left" as const, style: { bold: true } },
      { content: formatMoneyFull(cod), width: 40, align: "right" as const, style: { bold: true } },
    ]},

    ...(order.note ? [
      { type: "line" as const },
      { type: "text", content: `Ghi chú: ${order.note}` },
    ] : []),

    { type: "feed", lines: 3 },
    { type: "cut" as const },
  ];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useManualLabelPrint(order: ShippingOrder | null) {
  const { config } = usePrinterStore();
  const [printing, setPrinting] = useState(false);

  const isPrinterConfigured =
    config.connectionType === "wifi" ? !!config.ipAddress : !!config.macAddress;

  const handlePrint = useCallback(async () => {
    if (!order || printing) return;

    if (!isPrinterConfigured) {
      Alert.alert(
        "Chưa cấu hình máy in",
        "Vui lòng cấu hình máy in nhiệt trước khi in.",
      );
      return;
    }

    setPrinting(true);
    const address = buildAddress(config.connectionType, config.ipAddress, config.macAddress);

    try {
      const doc = buildLabelDocument(
        order,
        config.companyName || "",
      );

      const result = await ThermalPrinter.printReceipt({
        printers: [{ address, options: { encoding: "utf8", paperWidthMm: paperWidthMm(config.paperSize) } }],
        documents: [doc as Parameters<typeof ThermalPrinter.printReceipt>[0]["documents"][0]],
      });

      const res = result.results.get(address);
      if (res?.success) {
        Alert.alert("In thành công", "Nhãn vận đơn đã được gửi đến máy in.");
      } else {
        const msg = res?.error?.message ?? "Không thể in. Vui lòng thử lại.";
        Alert.alert("In thất bại", msg);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Không thể kết nối máy in.";
      Alert.alert("In thất bại", msg);
    } finally {
      setPrinting(false);
    }
  }, [order, printing, isPrinterConfigured, config]);

  return { printing, isPrinterConfigured, handlePrint };
}
