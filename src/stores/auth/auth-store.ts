import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";
import { secureStorage, zustandStorage } from "@utils/storage";
import { Account, AuthStoreState } from "./auth-types";
import { loginApi, registerApi } from "@modules/auth/services/api";

const DEFAULT_ACCOUNTS: Account[] = [
  { id: "admin", username: "admin", password: "123456" },
  { id: "phone-demo", username: "0816507286", password: "123456" },
];

const mergeDefaultAccounts = (accounts: Account[]): Account[] => {
  const map = new Map<string, Account>();
  DEFAULT_ACCOUNTS.forEach((account) =>
    map.set(account.username.toLowerCase(), account),
  );
  if (Array.isArray(accounts)) {
    accounts.forEach((account) => {
      if (account && account.username) {
        map.set(account.username.toLowerCase(), account);
      }
    });
  }
  return Array.from(map.values());
};

const customPersistStorage: StateStorage = {
  getItem: (name: string): string | null | Promise<string | null> => {
    // 1. Thử đọc từ MMKV (zustandStorage) trước
    const value = zustandStorage.getItem(name);
    if (value) {
      return value;
    }

    // 2. Nếu MMKV chưa có, đọc và di trú dữ liệu từ AsyncStorage cũ
    return (async () => {
      try {
        const oldVal = await AsyncStorage.getItem(name);
        if (oldVal) {
          zustandStorage.setItem(name, oldVal);
          return oldVal;
        }

        const rawUser = await AsyncStorage.getItem("flive_user");
        const rawAccounts = await AsyncStorage.getItem("flive_accounts");

        if (rawUser || rawAccounts) {
          const user = rawUser ? JSON.parse(rawUser) : null;
          const savedAccounts = rawAccounts
            ? JSON.parse(rawAccounts)
            : DEFAULT_ACCOUNTS;
          const accounts = mergeDefaultAccounts(savedAccounts);

          const migratedState = {
            state: {
              accounts,
              user,
            },
            version: 0,
          };

          const serialized = JSON.stringify(migratedState);
          zustandStorage.setItem(name, serialized);

          return serialized;
        }
      } catch (e) {
        console.warn("Lỗi khi di chuyển dữ liệu cũ sang Zustand MMKV:", e);
      }

      return null;
    })();
  },
  setItem: (name: string, value: string): void => {
    zustandStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    zustandStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      accounts: DEFAULT_ACCOUNTS,
      user: null,
      isRemembered: false,
      lastUsername: "",

      setLoginState: (username, remember) => {
        set({
          lastUsername: username,
          isRemembered: remember,
        });
      },

      login: async ({ username: phone, password, remember }) => {
        try {
          // loginApi → lưu token vào SecureStore, trả về payload từ server
          const payload = await loginApi({
            username: phone,
            password,
            remember,
          });

          // Phase 1: Set user cơ bản NGAY để AuthLayout thấy user != null → navigate
          // Tại sao không chờ bootstrap?
          //   → Bootstrap gọi thêm 1 API → chậm hơn, có thể fail
          //   → Navigation không nên phụ thuộc vào bootstrap thành công
          // Phase 2 (enrich với shop/license/tiktokChannels) sẽ chạy async trong useAuth hook
          set({
            isRemembered: remember ?? true,
            user: {
              id: payload?.user?.id || payload?.id || "",
              email: payload?.user?.email || null,
              fullName:
                payload?.user?.user_metadata?.full_name ||
                payload?.user?.user_metadata?.fullName ||
                null,
              phone: payload?.user?.user_metadata?.phone || phone,
              tiktokUsername:
                payload?.user?.user_metadata?.tiktok_id ||
                payload?.user?.user_metadata?.tiktok_username ||
                null,
              shopName: payload?.user?.user_metadata?.shop_name || null,
            },
          });

          return { ok: true };
        } catch (error) {
          console.error("Lỗi đăng nhập:", error);
          return { ok: false, message: "Đăng nhập thất bại" };
        }
      },

      register: async ({ fullName, username: phone, password, tiktokId }) => {
        try {
          await registerApi({
            fullName,
            username: phone,
            password,
            tiktokId,
            //@ts-ignore
            agreePolicy,
          });

          return { ok: true, message: "Đăng ký thành công!!" };
        } catch (error: any) {
          console.error("Lỗi đăng ký:", error);
          return {
            ok: false,
            message:
              error?.response?.data?.msg ||
              error?.message ||
              "Đăng ký thất bại",
          };
        }
      },

      logout: async () => {
        await secureStorage.clearAuth();
        set({ user: null });
      },

      // Được gọi bởi bootstrap flow trong useAuth hook.
      // Không liên quan đến login — chỉ để cập nhật user từ /me/bootstrap khi app khởi động
      // hoặc khi gọi refreshAuth().
      setUserFromBootstrap: (user) => {
        set({ user });
      },
    }),
    {
      name: "tiktok-live-auth-storage",
      storage: createJSONStorage(() => customPersistStorage),
    },
  ),
);
