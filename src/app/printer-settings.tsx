import { router } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@assets/icons";

type PrinterSettingItem = {
  key: string;
  label: string;
  value: string;
  layout?: "stacked";
  editable?: boolean;
};

const printerSettings: PrinterSettingItem[] = [
  {
    key: "printer",
    label: "Máy in",
    value: "Máy in LAN/Wifi (hóa đơn)",
    layout: "stacked",
    editable: true,
  },
  {
    key: "ip",
    label: "IP máy in",
    value: "192.168.1.242",
  },
  {
    key: "paper",
    label: "Khổ giấy in",
    value: "80mm",
    editable: true,
  },
  {
    key: "font",
    label: "Cỡ chữ",
    value: "Vừa",
    editable: true,
  },
];

const printTemplateSettings = [
  {
    key: "live",
    icon: icons.settings,
    label: "Điều chỉnh mẫu in Live",
  },
  {
    key: "ship",
    icon: icons.clipboard_check,
    label: "Điều chỉnh mẫu in vận đơn (SHIP)",
  },
] as const;

export default function PrinterSettingsScreen() {
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cài đặt máy in</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>!</Text>
          <Text style={styles.noticeText}>
            Đảm bảo máy in và điện thoại của bạn kết nối cùng mạng Wi-fi và cùng lớp mạng.
          </Text>
        </View>

        <View style={styles.printerCard}>
          {printerSettings.map((item, index) => (
            <View key={item.key}>
              <TouchableOpacity
                activeOpacity={item.editable ? 0.75 : 1}
                style={[styles.printerRow, item.layout === "stacked" && styles.printerRowStacked]}
              >
                <View style={[styles.printerTextWrap, item.layout === "stacked" && styles.printerTextStacked]}>
                  <Text style={styles.printerLabel}>{item.label}</Text>
                  <Text style={styles.printerValue}>{item.value}</Text>
                </View>
                {item.editable ? <Text style={styles.chevron}>›</Text> : null}
              </TouchableOpacity>
              {index < printerSettings.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}

          <TouchableOpacity style={styles.testButton} activeOpacity={0.85}>
            <Text style={styles.testButtonText}>In thử</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.templateList}>
          {printTemplateSettings.map((item, index) => (
            <View key={item.key}>
              <TouchableOpacity style={styles.templateRow} activeOpacity={0.75}>
                <View style={styles.templateLeft}>
                  <Image source={item.icon} style={styles.templateIcon} resizeMode="contain" />
                  <Text style={styles.templateText}>{item.label}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              {index < printTemplateSettings.length - 1 ? <View style={styles.templateDivider} /> : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#000",
    fontSize: 34,
    lineHeight: 34,
    marginTop: -4,
  },
  title: {
    flex: 1,
    marginHorizontal: 12,
    color: "#000",
    textAlign: "center",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "500",
  },
  headerPlaceholder: {
    width: 44,
    height: 44,
    opacity: 0,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 16,
  },
  noticeCard: {
    minHeight: 68,
    borderRadius: 12,
    backgroundColor: "#fdedd3",
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
    borderColor: "#2b2b2b",
    color: "#2b2b2b",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
  },
  noticeText: {
    flex: 1,
    color: "#2b2b2b",
    fontSize: 12,
    lineHeight: 18,
  },
  printerCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "#f2f2f2",
    padding: 16,
    gap: 16,
  },
  printerRow: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  printerRowStacked: {
    minHeight: 44,
  },
  printerTextWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  printerTextStacked: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 4,
  },
  printerLabel: {
    color: "#484848",
    fontSize: 12,
    lineHeight: 18,
  },
  printerValue: {
    color: "#000",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginTop: 16,
  },
  testButton: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  testButtonText: {
    color: "#000",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
  templateList: {
    gap: 0,
  },
  templateRow: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  templateLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  templateIcon: {
    width: 24,
    height: 24,
    tintColor: "#000",
  },
  templateText: {
    flex: 1,
    color: "#000",
    fontSize: 14,
    lineHeight: 22,
  },
  templateDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: 16,
  },
  chevron: {
    color: "#000",
    fontSize: 24,
    lineHeight: 24,
    transform: [{ rotate: "180deg" }],
  },
});
