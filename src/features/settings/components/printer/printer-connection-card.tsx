import { memo } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createStyles } from "@utils/createStyles";
import {
  PRINTER_CONNECTION_LABELS,
  PRINTER_CONNECTION_STATE_LABELS,
  PRINTER_FONT_SIZE_LABELS,
  PRINTER_PAPER_SIZE_LABELS,
  type PrinterConnectionState,
  type PrinterConnectionType,
  type PrinterFontSize,
  type PrinterPaperSize,
  type PrinterSheet,
} from "../../types/printer";

type PrinterConnectionCardProps = {
  connectionType: PrinterConnectionType;
  ipAddress: string;
  macAddress: string;
  paperSize: PrinterPaperSize;
  fontSize: PrinterFontSize;
  connectionState: PrinterConnectionState;
  connectedDevice: { name: string; type?: string } | null;
  onChangeConnectionType: (value: PrinterConnectionType) => void;
  onChangeIpAddress: (value: string) => void;
  onChangePaperSize: (value: PrinterPaperSize) => void;
  onChangeFontSize: (value: PrinterFontSize) => void;
  onOpenSheet: (sheet: PrinterSheet) => void;
  onConnect: () => void;
  onDisconnect: () => void;
};

export const PrinterConnectionCard = memo(function PrinterConnectionCard({
  connectionType,
  ipAddress,
  macAddress,
  paperSize,
  fontSize,
  connectionState,
  connectedDevice,
  onChangeConnectionType: _onChangeConnectionType,
  onChangeIpAddress,
  onChangePaperSize: _onChangePaperSize,
  onChangeFontSize: _onChangeFontSize,
  onOpenSheet,
  onConnect,
  onDisconnect,
}: PrinterConnectionCardProps) {
  const addressLabel = connectionType === "wifi" ? "IP máy in" : "Bluetooth";
  const addressValue = connectionType === "wifi" ? ipAddress : macAddress;
  const isConnected = connectionState === "connected";
  const isConnecting = connectionState === "connecting";

  return (
    <View style={styles.card}>
      {/*  Connection type  */}
      <TouchableOpacity
        activeOpacity={0.75}
        style={[styles.row, styles.rowStacked]}
        onPress={() => onOpenSheet("connection")}
      >
        <View style={[styles.rowTextWrap, styles.rowTextStacked]}>
          <Text style={styles.rowLabel}>Máy in</Text>
          <Text style={styles.rowValue}>
            {PRINTER_CONNECTION_LABELS[connectionType]}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/*  Address  */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{addressLabel}</Text>
        {connectionType === "wifi" ? (
          <View style={styles.ipInputContainer}>
            <TextInput
              style={styles.ipInput}
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
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowValue} numberOfLines={1}>
              {addressValue || "Chưa chọn"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/*  Paper size  */}
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.row}
        onPress={() => onOpenSheet("paper")}
      >
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowLabel}>Khổ giấy in</Text>
          <Text style={styles.rowValue}>
            {PRINTER_PAPER_SIZE_LABELS[paperSize]}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/*  Font size  */}
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.row}
        onPress={() => onOpenSheet("font")}
      >
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowLabel}>Cỡ chữ</Text>
          <Text style={styles.rowValue}>
            {PRINTER_FONT_SIZE_LABELS[fontSize]}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Connected device name/type */}
      {/* {isConnected && connectedDevice ? (
        <>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Tên máy in</Text>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowValue} numberOfLines={1}>
                {connectedDevice.name}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          {connectedDevice.type ? (
            <>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Loại máy</Text>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowValue} numberOfLines={1}>
                    {connectedDevice.type}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
            </>
          ) : null}
        </>
      ) : null} */}

      {/*  Connect / Disconnect  */}
      <View style={styles.connectRow}>
        <View style={styles.connectStatusWrap}>
          {isConnecting ? (
            <ActivityIndicator
              size="small"
              color="#ebb140"
              style={styles.connectSpinner}
            />
          ) : (
            <View
              style={[
                styles.connectDot,
                isConnected ? styles.connectDotOn : styles.connectDotOff,
              ]}
            />
          )}
          <Text
            style={[
              styles.connectStatusText,
              isConnected && styles.connectStatusTextOn,
            ]}
          >
            {PRINTER_CONNECTION_STATE_LABELS[connectionState]}
          </Text>
        </View>

        {isConnected ? (
          <TouchableOpacity
            activeOpacity={0.75}
            style={[styles.connectButton, styles.disconnectButton]}
            onPress={onDisconnect}
          >
            <Text
              style={[styles.connectButtonText, styles.disconnectButtonText]}
            >
              Ngắt kết nối
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.75}
            style={[
              styles.connectButton,
              isConnecting && styles.connectButtonDisabled,
            ]}
            onPress={onConnect}
            disabled={isConnecting}
          >
            <Text style={styles.connectButtonText}>
              {isConnecting ? "Đang kết nối..." : "Kết nối"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {/*  End connect / disconnect  */}
    </View>
  );
});

const styles = createStyles(({ colors }) => ({
  card: {
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border10,
    backgroundColor: colors.neutral50,
    padding: 16,
    gap: 16,
  },
  row: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  rowStacked: { minHeight: 44 },
  rowTextWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowTextStacked: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 4,
  },
  rowLabel: { color: colors.neutral400, fontSize: 12, lineHeight: 18 },
  rowValue: {
    color: colors.neutral900,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
  chevron: {
    color: colors.neutral900,
    fontSize: 24,
    lineHeight: 24,
    transform: [{ rotate: "180deg" }],
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.border10,
  },
  ipInputContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  ipInput: {
    flex: 1,
    color: colors.neutral900,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    padding: 0,
  },

  connectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 36,
  },
  connectStatusWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  connectSpinner: {
    width: 10,
    height: 10,
  },
  connectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectDotOn: { backgroundColor: colors.success },
  connectDotOff: { backgroundColor: colors.neutral300 },
  connectStatusText: {
    color: colors.neutral400,
    fontSize: 12,
    lineHeight: 18,
  },
  connectStatusTextOn: { color: colors.success },
  connectButton: {
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 16,
    backgroundColor: colors.neutral900,
    alignItems: "center",
    justifyContent: "center",
  },
  connectButtonDisabled: { opacity: 0.5 },
  connectButtonText: {
    color: colors.neutral100,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  disconnectButton: {
    backgroundColor: colors.neutral50,
    borderWidth: 0.5,
    borderColor: colors.border10,
  },
  disconnectButtonText: { color: colors.neutral900 },
}));
