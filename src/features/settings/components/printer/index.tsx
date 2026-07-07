import { useBottomSheet } from "@components/bottom-sheet/hook";
import { Header } from "@components/header";
import { useCallback } from "react";
import { ScrollView, Text, TextInput, Pressable, View } from "react-native";
import { createStyles } from "@utils/createStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { type PrinterSheet } from "../../types/printer";
import { usePrinterSettings } from "../../hooks/use-printer-settings";
import { PrinterConnectionCard } from "./printer-connection-card";
import { PrinterTemplateList } from "./printer-template-list";
import {
  PRINTER_CONNECTION_OPTIONS,
  PRINTER_FONT_OPTIONS,
  PRINTER_PAPER_OPTIONS,
} from "./constants";

type OptionItem<T extends string> = { value: T; label: string };

function OptionList<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: OptionItem<T>[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View style={styles.optionList}>
      {options.map((opt) => {
        const isSelected = opt.value === selected;
        return (
          <Pressable
            key={opt.value}
            style={[
              styles.sheetOption,
              isSelected && styles.sheetOptionSelected,
            ]}
            onPress={() => onSelect(opt.value)}
          >
            <Text
              style={[
                styles.sheetOptionText,
                isSelected && styles.sheetOptionTextSelected,
              ]}
            >
              {opt.label}
            </Text>
            {isSelected ? (
              <Text style={styles.sheetSelectedMark}>✓</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function PrinterSettingsScreen() {
  const { show, hide } = useBottomSheet();
  const {
    config,
    connectionState,
    connectedDevice,
    isTesting,
    handleTestPrint,
    handleConnect,
    handleDisconnect,
    setConnectionType,
    setIpAddress,
    setPaperSize,
    setFontSize,
    handleSave,
  } = usePrinterSettings();

  const openSheet = useCallback(
    (sheet: PrinterSheet) => {
      if (sheet === "connection") {
        show({
          content: (
            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>Loại kết nối</Text>
              <OptionList
                options={PRINTER_CONNECTION_OPTIONS}
                selected={config.connectionType}
                onSelect={(value) => {
                  setConnectionType(value);
                  hide();
                }}
              />
            </View>
          ),
        });
        return;
      }
      if (sheet === "paper") {
        show({
          content: (
            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>Khổ giấy in</Text>
              <OptionList
                options={PRINTER_PAPER_OPTIONS}
                selected={config.paperSize}
                onSelect={(value) => {
                  setPaperSize(value);
                  hide();
                }}
              />
            </View>
          ),
        });
        return;
      }
      if (sheet === "font") {
        show({
          content: (
            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>Cỡ chữ</Text>
              <OptionList
                options={PRINTER_FONT_OPTIONS}
                selected={config.fontSize}
                onSelect={(value) => {
                  setFontSize(value);
                  hide();
                }}
              />
            </View>
          ),
        });
      }
    },
    [
      show,
      hide,
      config.connectionType,
      config.paperSize,
      config.fontSize,
      setConnectionType,
      setPaperSize,
      setFontSize,
    ],
  );

  const noticeText =
    config.connectionType === "wifi"
      ? "Máy in và điện thoại phải cùng mạng Wi-Fi và cùng lớp mạng."
      : "Bluetooth phải bật và máy in đã được ghép đôi với điện thoại.";

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <Header title="Cài đặt máy in" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>!</Text>
          <Text style={styles.noticeText}>{noticeText}</Text>
        </View>

        <PrinterConnectionCard
          connectionType={config.connectionType}
          ipAddress={config.ipAddress}
          macAddress={config.macAddress}
          paperSize={config.paperSize}
          fontSize={config.fontSize}
          connectionState={connectionState}
          connectedDevice={connectedDevice}
          onChangeConnectionType={setConnectionType}
          onChangeIpAddress={setIpAddress}
          onChangePaperSize={setPaperSize}
          onChangeFontSize={setFontSize}
          onOpenSheet={openSheet}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nội dung hóa đơn</Text>
        </View>

        <View style={styles.configCard}>
          {/* Tên công ty */}
          <View style={styles.configRow}>
            <Text style={styles.configRowLabel}>Tên công ty</Text>
            <View style={styles.configInputContainer}>
              <TextInput
                style={styles.configTextInput}
                value={config.companyName}
                onChangeText={(val) => handleSave({ companyName: val })}
                placeholder="Ví dụ: CÔNG TY ABC"
                placeholderTextColor="#bdbdbd"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.configDivider} />

          {/* Địa chỉ công ty */}
          <View style={styles.configRow}>
            <Text style={styles.configRowLabel}>Địa chỉ công ty</Text>
            <View style={styles.configInputContainer}>
              <TextInput
                style={styles.configTextInput}
                value={config.companyAddress}
                onChangeText={(val) => handleSave({ companyAddress: val })}
                placeholder="Địa chỉ văn phòng / cửa hàng"
                placeholderTextColor="#bdbdbd"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.configDivider} />

          {/* Tên khách hàng / Kênh */}
          <View style={styles.configRow}>
            <Text style={styles.configRowLabel}>Tên khách hàng</Text>
            <View style={styles.configInputContainer}>
              <TextInput
                style={styles.configTextInput}
                value={config.tiktokUsername}
                onChangeText={(val) => handleSave({ tiktokUsername: val })}
                placeholder="Tên người nhận hàng"
                placeholderTextColor="#bdbdbd"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.configDivider} />

          {/* Số điện thoại */}
          <View style={styles.configRow}>
            <Text style={styles.configRowLabel}>Số điện thoại</Text>
            <View style={styles.configInputContainer}>
              <TextInput
                style={styles.configTextInput}
                value={config.userPhone}
                onChangeText={(val) => handleSave({ userPhone: val })}
                placeholder="SĐT liên hệ"
                placeholderTextColor="#bdbdbd"
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.configDivider} />

          {/* Địa chỉ khách hàng */}
          <View style={styles.configRow}>
            <Text style={styles.configRowLabel}>Địa chỉ giao hàng</Text>
            <View style={styles.configInputContainer}>
              <TextInput
                style={styles.configTextInput}
                value={config.userAddress}
                onChangeText={(val) => handleSave({ userAddress: val })}
                placeholder="Số nhà, tên đường, thành phố..."
                placeholderTextColor="#bdbdbd"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.configDivider} />

          {/* Số hóa đơn */}
          <View style={styles.configRow}>
            <Text style={styles.configRowLabel}>Số hóa đơn bắt đầu</Text>
            <View style={styles.configInputContainer}>
              <TextInput
                style={styles.configTextInput}
                value={config.recordNumb?.toString()}
                onChangeText={(val) => {
                  const num = parseInt(val, 10);
                  handleSave({ recordNumb: isNaN(num) ? 0 : num });
                }}
                placeholder="Ví dụ: 12345"
                placeholderTextColor="#bdbdbd"
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.testButton, isTesting && styles.testButtonDisabled]}
          onPress={handleTestPrint}
          disabled={isTesting}
        >
          <Text style={styles.testButtonText}>
            {isTesting ? "Đang in thử..." : "In thử"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = createStyles(({ colors }) => ({
  safeArea: { flex: 1, backgroundColor: colors.neutral100 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 16,
  },
  noticeCard: {
    borderRadius: 12,
    backgroundColor: colors.pinkLight,
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  noticeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.neutral500,
    color: colors.neutral500,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
  },
  noticeText: {
    flex: 1,
    color: colors.neutral500,
    fontSize: 12,
    lineHeight: 18,
  },
  testButton: {
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral100,
    alignItems: "center",
    justifyContent: "center",
  },
  testButtonText: {
    color: colors.neutral900,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
  testButtonDisabled: { opacity: 0.5 },
  sectionHeader: { marginTop: 8, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: colors.neutral500 },
  configCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border10,
    backgroundColor: colors.neutral50,
    padding: 16,
    gap: 16,
  },
  configRow: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  configRowLabel: {
    width: 120,
    color: colors.neutral400,
    fontSize: 12,
    lineHeight: 18,
  },
  configInputContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  configTextInput: {
    flex: 1,
    color: colors.neutral900,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    padding: 0,
    textAlign: "right",
  },
  configDivider: {
    height: 0.5,
    backgroundColor: colors.border10,
  },
  sheetContent: { paddingHorizontal: 16, paddingBottom: 16 },
  sheetTitle: {
    color: colors.neutral900,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  optionList: { gap: 8 },
  sheetOption: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sheetOptionSelected: { backgroundColor: colors.warningLight },
  sheetOptionText: {
    flex: 1,
    color: colors.neutral900,
    fontSize: 14,
    lineHeight: 22,
  },
  sheetOptionTextSelected: { color: colors.warning, fontWeight: "600" },
  sheetSelectedMark: {
    color: colors.warning,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
  },
}));
