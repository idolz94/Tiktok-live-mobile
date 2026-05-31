import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "./constants";

export const secureStorage = {
  async getAccessToken() {
    return SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async setAccessToken(token: string) {
    return SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  async removeAccessToken() {
    return SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken() {
    return SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string) {
    return SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  async removeRefreshToken() {
    return SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async clearAuth() {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  },
};
