import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "@utils/storage";
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
      accessToken: null,
      refreshToken: null,
      isRemembered: false,

      login: async ({ phone, password, remember }) => {
        try {
          const response = await loginApi({
            phone,
            password,
            remember,
          });

          set({
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isRemembered: remember,
            user: {
              id: response.user?.id,
              username: response.user?.user_metadata?.full_name || phone,
              phone: response.user?.user_metadata?.phone,
              fullName: response.user?.user_metadata?.full_name,
              tiktokId: response.user?.user_metadata?.tiktok_id,
              shopName: response.user?.user_metadata?.shop_name,
              email: response.user?.email,
            },
          });

          return { ok: true };
        } catch (error) {
          console.error("Lỗi đăng nhập:", error);
          return { ok: false, message: "Đăng nhập thất bại" };
        }
      },

      register: async ({ fullName, phone, password, tiktokId }) => {
        try {
          const response = await registerApi({
            fullName,
            phone,
            password,
            tiktokId,
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

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isRemembered: false,
        });
      },
    }),
    {
      name: "tiktok-live-auth-storage",
      storage: createJSONStorage(() => customPersistStorage),
    },
  ),
);
