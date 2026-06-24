import { Text, TextInput, TouchableOpacity, View } from "react-native";
import {
  PRINTER_CONNECTION_LABELS,
  PRINTER_FONT_SIZE_LABELS,
  PRINTER_PAPER_SIZE_LABELS,
  type PrinterConnectionType,
  type PrinterFontSize,
  type PrinterPaperSize,
} from "../../types/printer";
import { printerSettingsStyles as s } from "./printer-settings.styles";

export type Sheet = "connection" | "paper" | "font";

type PrinterConnectionCardProps = {
  connectionType: PrinterConnectionType;
  ipAddress: string;
  macAddress: string;
  paperSize: PrinterPaperSize;
  fontSize: PrinterFontSize;
  onChangeConnectionType: (value: PrinterConnectionType) => void;
  onChangeIpAddress: (value: string) => void;
  onChangePaperSize: (value: PrinterPaperSize) => void;
  onChangeFontSize: (value: PrinterFontSize) => void;
  onOpenSheet: (sheet: Sheet) => void;
};

export function PrinterConnectionCard({
  connectionType,
  ipAddress,
  macAddress,
  paperSize,
  fontSize,
  onChangeConnectionType: _onChangeConnectionType,
  onChangeIpAddress,
  onChangePaperSize: _onChangePaperSize,
  onChangeFontSize: _onChangeFontSize,
  onOpenSheet,
}: PrinterConnectionCardProps) {
  const addressLabel = connectionType === "wifi" ? "IP máy in" : "Bluetooth";
  const addressValue = connectionType === "wifi" ? ipAddress : macAddress;

  return (
    <View style={s.card}>
      {/* Connection type */}
      <TouchableOpacity
        activeOpacity={0.75}
        style={[s.row, s.rowStacked]}
        onPress={() => onOpenSheet("connection")}
      >
        <View style={[s.rowTextWrap, s.rowTextStacked]}>
          <Text style={s.rowLabel}>Máy in</Text>
          <Text style={s.rowValue}>{PRINTER_CONNECTION_LABELS[connectionType]}</Text>
        </View>
        <Text style={s.chevron}>›</Text>
      </TouchableOpacity>

      <View style={s.divider} />

      {/* Address row */}
      <View style={s.row}>
        <Text style={s.rowLabel}>{addressLabel}</Text>
        {connectionType === "wifi" ? (
          <View style={s.ipInputContainer}>
            <TextInput
              style={s.ipInput}
              value={ipAddress}
              onChangeText={onChangeIpAddress}
              placeholder="192.168.1.x"
              placeholderTextColor="#bdbdbd"
              keyboardType="decimal-pad"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        ) : (
          <View style={s.rowTextWrap}>
            <Text style={s.rowValue} numberOfLines={1}>
              {addressValue || "Chưa chọn"}
            </Text>
          </View>
        )}
      </View>

      <View style={s.divider} />

      {/* Paper size */}
      <TouchableOpacity
        activeOpacity={0.75}
        style={s.row}
        onPress={() => onOpenSheet("paper")}
      >
        <View style={s.rowTextWrap}>
          <Text style={s.rowLabel}>Khổ giấy in</Text>
          <Text style={s.rowValue}>{PRINTER_PAPER_SIZE_LABELS[paperSize]}</Text>
        </View>
        <Text style={s.chevron}>›</Text>
      </TouchableOpacity>

      <View style={s.divider} />

      {/* Font size */}
      <TouchableOpacity
        activeOpacity={0.75}
        style={s.row}
        onPress={() => onOpenSheet("font")}
      >
        <View style={s.rowTextWrap}>
          <Text style={s.rowLabel}>Cỡ chữ</Text>
          <Text style={s.rowValue}>{PRINTER_FONT_SIZE_LABELS[fontSize]}</Text>
        </View>
        <Text style={s.chevron}>›</Text>
      </TouchableOpacity>
    </View>
  );
}
