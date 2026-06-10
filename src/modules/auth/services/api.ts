import { LoginForm, RegisterForm } from "src/schemas/auth";
import { apiClient } from "@utils/http/axios";
import { secureStorage } from "@utils/storage";
import { phoneToAuthEmail } from "@utils/string";
import { MeBootstrapResponse } from "@stores/auth";
import { normalizeMeBootstrap } from "@stores/auth/auth-utils";

export const registerApi = async ({
  phone,
  password,
  tiktokId,
  fullName,
  agreePolicy,
}: RegisterForm) => {
  const response = await apiClient.post("/auth/register", {
    defaultTikTokUsername: tiktokId,
    email: phoneToAuthEmail(phone),
    fullName,
    loginType: "phone_password",
    password,
    phone,
    shopName: `${fullName}'s Shop`,
    tiktokId: tiktokId.startsWith("@") ? tiktokId : `@${tiktokId}`,
  });
  return response.data;
};

export const loginApi = async ({ phone, password, remember }: LoginForm) => {
  const response = await apiClient.post("/auth/login", {
    phone,
    email: phoneToAuthEmail(phone),
    password,
    remember: remember ?? true,
    loginType: "phone_password",
  });

  const payload = response.data?.data;

  const token = String(
    payload?.accessToken ||
      payload?.access_token ||
      payload?.token ||
      payload?.session?.accessToken ||
      payload?.session?.access_token ||
      "",
  ).trim();

  if (!token) {
    throw new Error("No access token received");
  }

  await secureStorage.setAccessToken(token);

  return payload;
};

export const logoutApi = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};

const EMPTY_ME: MeBootstrapResponse = {
  user: null,
  profile: null,
  shopMember: null,
  shop: null,
  license: null,
  tiktokChannels: [],
  canUseApp: false,
  reason: "NO_USER",
};

export const getMeBootstrapApi = async (): Promise<MeBootstrapResponse> => {
  try {
    // Dùng apiClient (API_URL_ENDPOINT) vì /me/bootstrap là REST endpoint,
    // KHÔNG phải SSE endpoint — getRequest() dùng DEFAULT_WS_URL (port 8765) sẽ hit sai server.
    //
    // Dùng GET (không phải POST) — đây là endpoint đọc dữ liệu, không ghi.
    // Token tự động được attach bởi apiClient.interceptors.request (đọc từ SecureStore).
    const response = await apiClient.get("/me/bootstrap");

    // Axios wrap response trong response.data, còn data thực nằm trong response.data.data
    // normalizeMeBootstrap() xử lý cả 2 format để an toàn
    return normalizeMeBootstrap(response.data?.data ?? response.data);
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      // 401 = token hết hạn hoặc không có token
      // 403 = có token nhưng không có quyền truy cập
      // → Cả hai đều nghĩa là "chưa/không thể dùng app" → trả về user rỗng, KHÔNG throw
      return EMPTY_ME;
    }

    // Lỗi khác (network, 500...) → throw lên để bootstrap xử lý
    throw error;
  }
};

