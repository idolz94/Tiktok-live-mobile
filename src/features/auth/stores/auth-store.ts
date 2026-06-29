import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";
import { secureStorage, zustandStorage } from "@utils/storage";
import { AuthStoreState } from "./auth-types";

const customPersistStorage: StateStorage = {
  getItem: (name: string): string | null | Promise<string | null> => {
    const value = zustandStorage.getItem(name);
    if (value) {
      return value;
    }

    return (async () => {
      try {
        const oldVal = await AsyncStorage.getItem(name);
        if (oldVal) {
          zustandStorage.setItem(name, oldVal);
          return oldVal;
        }

        const rawUser = await AsyncStorage.getItem("flive_user");

        if (rawUser) {
          const user = JSON.parse(rawUser);
          const migratedState = {
            state: {
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
    (set) => ({
      user: null,
      isRemembered: false,
      lastUsername: "",

      setLoginState: (username, remember) => {
        set({
          lastUsername: username,
          isRemembered: remember,
        });
      },

      logout: async () => {
        await secureStorage.clearAuth();
        set({ user: null });
      },

      setUserFromBootstrap: (user) => {
        set({ user });
      },

      patchTiktokChannels: (channels) => {
        set((state) => state.user ? { user: { ...state.user, tiktokChannels: channels } } : {});
      },
    }),
    {
      name: "tiktok-live-auth-storage",
      storage: createJSONStorage(() => customPersistStorage),
    },
  ),
);
