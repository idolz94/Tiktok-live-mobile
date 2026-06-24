import { useBottomSheet } from "@components/bottom-sheet/hook";
import { router } from "expo-router";
import { useCallback } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  PRINTER_CONNECTION_LABELS,
  PRINTER_FONT_SIZE_LABELS,
  PRINTER_PAPER_SIZE_LABELS,
  type PrinterConnectionType,
  type PrinterFontSize,
  type PrinterPaperSize,
} from "../../types/printer";
import { usePrinterSettings } from "../../hooks/use-printer-settings";
import { PrinterConnectionCard, type Sheet } from "./printer-connection-card";
import { PrinterTemplateList } from "./printer-template-list";
import { printerSettingsStyles as s } from "./printer-settings.styles";

const CONNECTION_OPTIONS: { value: PrinterConnectionType; label: string }[] = [
  { value: "wifi", label: PRINTER_CONNECTION_LABELS.wifi },
  { value: "bluetooth", label: PRINTER_CONNECTION_LABELS.bluetooth },
];

const PAPER_OPTIONS: { value: PrinterPaperSize; label: string }[] = [
  { value: "58mm", label: PRINTER_PAPER_SIZE_LABELS["58mm"] },
  { value: "80mm", label: PRINTER_PAPER_SIZE_LABELS["80mm"] },
];

const FONT_OPTIONS: { value: PrinterFontSize; label: string }[] = [
  { value: "small", label: PRINTER_FONT_SIZE_LABELS.small },
  { value: "medium", label: PRINTER_FONT_SIZE_LABELS.medium },
  { value: "large", label: PRINTER_FONT_SIZE_LABELS.large },
];

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
    <View style={{ gap: 8, paddingBottom: 8 }}>
      {options.map((opt) => {
        const isSelected = opt.value === selected;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[s.sheetOption, isSelected && s.sheetOptionSelected]}
            activeOpacity={0.7}
            onPress={() => onSelect(opt.value)}
          >
            <Text style={[s.sheetOptionText, isSelected && s.sheetOptionTextSelected]}>
              {opt.label}
            </Text>
            {isSelected ? <Text style={s.sheetSelectedMark}>✓</Text> : null}
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
    isTesting,
    handleTestPrint,
    setConnectionType,
    setIpAddress,
    setPaperSize,
    setFontSize,
  } = usePrinterSettings();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  const openSheet = useCallback(
    (sheet: Sheet) => {
      if (sheet === "connection") {
        show({
          content: (
            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              <Text style={s.sheetTitle}>Loại kết nối</Text>
              <OptionList
                options={CONNECTION_OPTIONS}
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
            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              <Text style={s.sheetTitle}>Khổ giấy in</Text>
              <OptionList
                options={PAPER_OPTIONS}
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
            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              <Text style={s.sheetTitle}>Cỡ chữ</Text>
              <OptionList
                options={FONT_OPTIONS}
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
    [show, hide, config.connectionType, config.paperSize, config.fontSize, setConnectionType, setPaperSize, setFontSize],
  );

  const noticeText =
    config.connectionType === "wifi"
      ? "Máy in và điện thoại phải cùng mạng Wi-Fi và cùng lớp mạng."
      : "Bluetooth phải bật và máy in đã được ghép đôi với điện thoại.";

  return (
    <SafeAreaView style={s.safeArea} edges={["top", "left", "right", "bottom"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={handleBack} style={s.headerButton} activeOpacity={0.8}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Cài đặt máy in</Text>
        <View style={s.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.noticeCard}>
          <Text style={s.noticeIcon}>!</Text>
          <Text style={s.noticeText}>{noticeText}</Text>
        </View>

        <PrinterConnectionCard
          connectionType={config.connectionType}
          ipAddress={config.ipAddress}
          macAddress={config.macAddress}
          paperSize={config.paperSize}
          fontSize={config.fontSize}
          onChangeConnectionType={setConnectionType}
          onChangeIpAddress={setIpAddress}
          onChangePaperSize={setPaperSize}
          onChangeFontSize={setFontSize}
          onOpenSheet={openSheet}
        />

        <TouchableOpacity
          style={[s.testButton, isTesting && s.testButtonDisabled]}
          activeOpacity={0.85}
          onPress={handleTestPrint}
          disabled={isTesting}
        >
          <Text style={s.testButtonText}>
            {isTesting ? "Đang in thử..." : "In thử"}
          </Text>
        </TouchableOpacity>

        <PrinterTemplateList />
      </ScrollView>
    </SafeAreaView>
  );
}
