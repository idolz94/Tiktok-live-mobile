# TikTok Live React Native version

Đây là bản React Native/Expo được convert từ source Next.js `src` bạn upload.

## Đã convert

- Login / Register local bằng AsyncStorage
- Dashboard mobile app layout
- Kết nối TikTok Live qua SSE API
- Nhận comment realtime bằng `react-native-sse`
- Lịch sử phiên LIVE bằng AsyncStorage
- Tạo đơn từ comment
- Lưu đơn hàng bằng AsyncStorage
- Khách hàng sinh ra từ đơn đã tạo
- Tab: Trang chủ, Khách hàng, Vận đơn, Báo cáo, Cài đặt

## Cách chạy

```bash
cd tiktok-live-react-native
npm install
npm start
```

Chạy iOS simulator:

```bash
npm run ios
```

Chạy Android:

```bash
npm run android
```

## Cấu hình SSE API

Tạo file `.env`:

```env
EXPO_PUBLIC_TIKTOK_SSE_API=http://YOUR_LAN_IP:8765
EXPO_PUBLIC_TIKTOK_USERNAME=conlavungday02
```

Lưu ý:

- Nếu chạy trên iPhone thật hoặc simulator, không nên dùng `localhost` nếu Python chạy ở máy Mac.
- Hãy dùng IP LAN của Mac, ví dụ `http://192.168.1.24:8765`.
- Python SSE server cần chạy trước.

## Package chính

- `expo`
- `react-native`
- `@react-native-async-storage/async-storage`
- `react-native-sse`

## Ghi chú

Source Next.js dùng Tailwind/HTML nên không thể copy 1:1. Bản này đã chuyển sang component React Native + StyleSheet.
Assets login từ `/public/assets` không có trong file upload, nên màn login dùng banner placeholder màu vàng.
