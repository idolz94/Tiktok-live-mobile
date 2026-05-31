import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

export const storage = createMMKV({
  id: "app-storage",
});

export const zustandStorage: StateStorage = {
  getItem: (key) => storage.getString(key) ?? null,

  setItem: (key, value) => {
    storage.set(key, value);
  },

  removeItem: (key) => {
    storage.remove(key);
  },
};
