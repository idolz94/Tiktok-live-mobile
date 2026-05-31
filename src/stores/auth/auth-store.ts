import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";
import { createId } from "@utils/id";
import { Account, AuthStoreState } from "./auth-types";

const DEFAULT_ACCOUNTS: Account[] = [
  { id: "admin", username: "admin", password: "123456" },
  { id: "phone-demo", username: "0816507286", password: "123456" },
];

function mergeDefaultAccounts(accounts: Account[]): Account[] {
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
}

const customPersistStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await AsyncStorage.getItem(name);
    if (value) {
      return value;
    }

    try {
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
        await AsyncStorage.setItem(name, serialized);

        return serialized;
      }
    } catch (e) {
      console.warn("Lỗi khi di chuyển dữ liệu cũ sang Zustand:", e);
    }

    return null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      accounts: DEFAULT_ACCOUNTS,
      user: null,

      login: (username, password) => {
        const cleanUsername = username.trim();
        if (!cleanUsername || !password) {
          return { ok: false, message: "Vui lòng nhập tài khoản và mật khẩu" };
        }

        const state = get();
        const accounts = mergeDefaultAccounts(state.accounts);
        const account = accounts.find(
          (item) =>
            item.username.toLowerCase() === cleanUsername.toLowerCase() &&
            item.password === password,
        );

        if (!account) {
          return { ok: false, message: "Sai tài khoản hoặc mật khẩu" };
        }

        set({
          user: { id: account.id, username: account.username },
        });

        return { ok: true };
      },

      register: (username, password) => {
        const cleanUsername = username.trim();
        if (cleanUsername.length < 3) {
          return { ok: false, message: "Tài khoản cần ít nhất 3 ký tự" };
        }
        if (password.length < 6) {
          return { ok: false, message: "Mật khẩu cần ít nhất 6 ký tự" };
        }

        const state = get();
        const accounts = mergeDefaultAccounts(state.accounts);
        const existed = accounts.some(
          (item) => item.username.toLowerCase() === cleanUsername.toLowerCase(),
        );

        if (existed) {
          return { ok: false, message: "Tài khoản đã tồn tại" };
        }

        const newAccount: Account = {
          id: createId(),
          username: cleanUsername,
          password,
        };

        const nextAccounts = [newAccount, ...accounts];
        set({
          accounts: nextAccounts,
          user: { id: newAccount.id, username: newAccount.username },
        });

        return { ok: true };
      },

      logout: () => {
        set({ user: null });
      },
    }),
    {
      name: "tiktok-live-auth-storage",
      storage: createJSONStorage(() => customPersistStorage),
    },
  ),
);
