import { useBottomSheet } from "@components/bottom-sheet/hook";
import { router } from "expo-router";
import { useCallback } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { createStyles } from "@utils/createStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { type PrinterSheet } from "../../types/printer";import { usePrinterSettings } from "../../hooks/use-printer-settings";
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
          <TouchableOpacity
            key={opt.value}
            style={[styles.sheetOption, isSelected && styles.sheetOptionSelected]}
            activeOpacity={0.7}
            onPress={() => onSelect(opt.value)}
          >
            <Text style={[styles.sheetOptionText, isSelected && styles.sheetOptionTextSelected]}>
              {opt.label}
            </Text>
            {isSelected ? <Text style={styles.sheetSelectedMark}>✓</Text> : null}
          </TouchableOpacity>
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
    isTesting,
    handleTestPrint,
    handleConnect,
    handleDisconnect,
    setConnectionType,
    setIpAddress,
    setPaperSize,
    setFontSize,
  } = usePrinterSettings();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

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
                onSelect={(value) => { setConnectionType(value); hide(); }}
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
                onSelect={(value) => { setPaperSize(value); hide(); }}
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
                onSelect={(value) => { setFontSize(value); hide(); }}
              />
            </View>
          ),
        });
      }
    },
    [show, hide, config.connectionType, config.paperSize, config.fontSize, setConnectionType, setPaperSize, setFontSize],
  );

  const noticeText =
    config.connectionType === "wifi"
      ? "Máy in và điện thoại phải cùng mạng Wi-Fi và cùng lớp mạng."
      : "Bluetooth phải bật và máy in đã được ghép đôi với điện thoại.";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton} activeOpacity={0.8}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cài đặt máy in</Text>
        <View style={styles.headerPlaceholder} />
      </View>

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
          onChangeConnectionType={setConnectionType}
          onChangeIpAddress={setIpAddress}
          onChangePaperSize={setPaperSize}
          onChangeFontSize={setFontSize}
          onOpenSheet={openSheet}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />

        <TouchableOpacity
          style={[styles.testButton, isTesting && styles.testButtonDisabled]}
          activeOpacity={0.85}
          onPress={handleTestPrint}
          disabled={isTesting}
        >
          <Text style={styles.testButtonText}>
            {isTesting ? "Đang in thử..." : "In thử"}
          </Text>
        </TouchableOpacity>

        <PrinterTemplateList />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = createStyles(({ colors }) => ({
  safeArea: { flex: 1, backgroundColor: colors.neutral100 },
  header: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.neutral100,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral50,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { color: colors.neutral900, fontSize: 34, lineHeight: 34, marginTop: -4 },
  headerPlaceholder: { width: 44, height: 44, opacity: 0 },
  title: {
    flex: 1,
    marginHorizontal: 12,
    color: colors.neutral900,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "500",
  },
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
  noticeText: { flex: 1, color: colors.neutral500, fontSize: 12, lineHeight: 18 },
  testButton: {
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral100,
    alignItems: "center",
    justifyContent: "center",
  },
  testButtonText: { color: colors.neutral900, fontSize: 14, lineHeight: 22, fontWeight: "500" },
  testButtonDisabled: { opacity: 0.5 },
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
  sheetOptionText: { flex: 1, color: colors.neutral900, fontSize: 14, lineHeight: 22 },
  sheetOptionTextSelected: { color: colors.warning, fontWeight: "600" },
  sheetSelectedMark: { color: colors.warning, fontSize: 16, lineHeight: 20, fontWeight: "700" },
}));
