import { LoginForm, RegisterForm } from "@app-types/auth";
import { apiClient } from "@utils/http/axios";
import { secureStorage } from "@utils/storage";
import { phoneToAuthEmail } from "@utils/string";

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
