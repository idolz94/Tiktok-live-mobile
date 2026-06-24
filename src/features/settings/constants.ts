import { router } from "expo-router";

export type Setting = {
  icon: string;
  label: string;
  onPress?: () => void;
};

export const AVATAR_URL =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&q=80";

const openProductInfoSetup = () => router.push("/product-info-setup" as never);

export const settingGroups: Setting[][] = [
  [
    {
      icon: "♪",
      label: "Quản lý kênh Tiktok",
      onPress: () => {
        router.navigate("/manage-tiktok-channel");
      },
    },
    { icon: "f", label: "Quản lý kênh Facebook" },
  ],
  [
    { icon: "⚙", label: "Cài đặt chung" },
    {
      icon: "⌘",
      label: "Cài đặt thông tin SP trước Live",
      onPress: openProductInfoSetup,
    },
    { icon: "⇄", label: "Cài đặt máy in", onPress: () => router.push("/printer-settings" as never) },
    { icon: "↕", label: "Cấu hình vận chuyển" },
  ],
  [
    { icon: "文", label: "Ngôn ngữ" },
    { icon: "?", label: "Hỗ trợ" },
  ],
];

export const SETTINGS_COPY = {
  title: "Hồ sơ",
  subscriptionTitle: "Gói Lumi Live Mini",
  subscriptionSubtitle: "1172-2700 đơn",
  upgrade: "Nâng cấp",
  tiktokLabel: "TikTok username",
  connected: "Đã kết nối",
  disconnected: "Chưa kết nối",
  connectButton: "Kết nối / Đổi username",
  logout: "Đăng xuất",
} as const;
