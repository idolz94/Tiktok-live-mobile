import { storage } from "./mmkv";
import { STORAGE_KEYS } from "./constants";

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const loadString = (key: StorageKey): string | null => {
  try {
    return storage.getString(key) ?? null;
  } catch {
    return null;
  }
};

export const saveString = (
  key: StorageKey,
  value: string,
): boolean => {
  try {
    storage.set(key, value);
    return true;
  } catch {
    return false;
  }
};

export const loadBoolean = (key: StorageKey): boolean | null => {
  try {
    return storage.getBoolean(key) ?? null;
  } catch {
    return null;
  }
};

export const saveBoolean = (
  key: StorageKey,
  value: boolean,
): boolean => {
  try {
    storage.set(key, value);
    return true;
  } catch {
    return false;
  }
};

export const loadNumber = (key: StorageKey): number | null => {
  try {
    return storage.getNumber(key) ?? null;
  } catch {
    return null;
  }
};

export const saveNumber = (
  key: StorageKey,
  value: number,
): boolean => {
  try {
    storage.set(key, value);
    return true;
  } catch {
    return false;
  }
};

export const loadObject = <T>(key: StorageKey): T | null => {
  try {
    const value = storage.getString(key);

    if (value === undefined) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch (error) {
    if (__DEV__) {
      console.error(`[Storage Helper] Error loading key "${key}":`, error);
    }
    return null;
  }
};

export const saveObject = (
  key: StorageKey,
  value: unknown,
): boolean => {
  try {
    storage.set(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const remove = (key: StorageKey): boolean => {
  try {
    storage.remove(key);
    return true;
  } catch {
    return false;
  }
};

export const contains = (key: StorageKey): boolean => {
  try {
    return storage.contains(key);
  } catch {
    return false;
  }
};

export const getAllKeys = (): string[] => {
  try {
    return storage.getAllKeys();
  } catch {
    return [];
  }
};

export const clearStorage = (): boolean => {
  try {
    storage.clearAll();
    return true;
  } catch {
    return false;
  }
};
