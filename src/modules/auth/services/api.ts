import { LoginForm, RegisterForm } from "@app-types/auth";
import { apiClient } from "@utils/http/axios";
import { phoneToAuthEmail } from "@utils/string";

export const registerApi = async ({
  phone,
  password,
  tiktokId,
  fullName,
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

export const loginApi = async ({ phone, password }: LoginForm) => {
  const response = await apiClient.post("/auth/login", {
    email: phoneToAuthEmail(phone),
    loginType: "phone_password",
    password,
    phone,
  });
  return response.data;
};

export const logoutApi = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};
