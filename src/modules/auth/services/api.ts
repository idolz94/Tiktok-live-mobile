import { supabaseClient } from "@utils/http/axios";
import { phoneToAuthEmail } from "@utils/string";
import { LoginForm, RegisterForm } from "@app/(auth)/_type";

export const registerApi = async ({
  phone,
  password,
  tiktokId,
  fullName,
}: RegisterForm) => {
  const response = await supabaseClient.post("/auth/v1/signup", {
    email: phoneToAuthEmail(phone),
    password: password,
    data: {
      full_name: fullName,
      phone: phone,
      tiktok_id: tiktokId.startsWith("@") ? tiktokId : `@${tiktokId}`,
      default_tiktok_username: tiktokId,
      shop_name: `${fullName}'s Shop`,
      login_type: "phone_password",
    },
  });
  return response.data;
};

export const loginApi = async ({ phone, password }: LoginForm) => {
  const response = await supabaseClient.post(
    "/auth/v1/token?grant_type=password",
    {
      email: phoneToAuthEmail(phone),
      password: password,
    },
  );
  return response.data;
};

export const logoutApi = async () => {
  const response = await supabaseClient.post("/auth/v1/logout");
  return response.data;
};
