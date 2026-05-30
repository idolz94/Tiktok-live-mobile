import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { AuthUser } from "@/types";
import { createId } from "@/utils/id";

type Account = { id: string; username: string; password: string };
type AuthState = { accounts: Account[]; user: AuthUser | null };
type AuthResult = { ok: boolean; message?: string };

const ACCOUNT_STORAGE_KEY = "flive_accounts";
const USER_STORAGE_KEY = "flive_user";

const DEFAULT_ACCOUNTS: Account[] = [
  { id: "admin", username: "admin", password: "123456" },
  { id: "phone-demo", username: "0816507286", password: "123456" }
];

let cachedState: AuthState = { accounts: DEFAULT_ACCOUNTS, user: null };
let hasLoaded = false;
const listeners = new Set<(state: AuthState) => void>();

function notify(nextState: AuthState) {
  cachedState = nextState;
  listeners.forEach((listener) => listener(nextState));
}

function mergeDefaultAccounts(accounts: Account[]) {
  const map = new Map<string, Account>();
  DEFAULT_ACCOUNTS.forEach((account) => map.set(account.username.toLowerCase(), account));
  accounts.forEach((account) => map.set(account.username.toLowerCase(), account));
  return Array.from(map.values());
}

async function readAuthState(): Promise<AuthState> {
  try {
    const [rawAccounts, rawUser] = await Promise.all([
      AsyncStorage.getItem(ACCOUNT_STORAGE_KEY),
      AsyncStorage.getItem(USER_STORAGE_KEY)
    ]);

    const savedAccounts = rawAccounts ? JSON.parse(rawAccounts) : DEFAULT_ACCOUNTS;
    const savedUser = rawUser ? JSON.parse(rawUser) : null;

    return {
      accounts: mergeDefaultAccounts(Array.isArray(savedAccounts) ? savedAccounts : DEFAULT_ACCOUNTS),
      user: savedUser
    };
  } catch {
    return { accounts: DEFAULT_ACCOUNTS, user: null };
  }
}

async function writeAuthState(state: AuthState) {
  await AsyncStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(state.accounts));

  if (state.user) {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.user));
  } else {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  }
}

async function loadAuthOnce() {
  if (hasLoaded) return cachedState;
  const state = await readAuthState();
  hasLoaded = true;
  notify(state);
  return state;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(cachedState);
  const [isLoading, setIsLoading] = useState(!hasLoaded);

  useEffect(() => {
    listeners.add(setState);
    loadAuthOnce().finally(() => setIsLoading(false));

    return () => {
      listeners.delete(setState);
    };
  }, []);

  const updateAuthState = useCallback(async (nextState: AuthState) => {
    notify(nextState);
    await writeAuthState(nextState);
  }, []);

  const login = useCallback(
    (username: string, password: string): AuthResult => {
      const cleanUsername = username.trim();

      if (!cleanUsername || !password) {
        return { ok: false, message: "Vui lòng nhập tài khoản và mật khẩu" };
      }

      const account = cachedState.accounts.find(
        (item) => item.username.toLowerCase() === cleanUsername.toLowerCase() && item.password === password
      );

      if (!account) return { ok: false, message: "Sai tài khoản hoặc mật khẩu" };

      void updateAuthState({
        ...cachedState,
        user: { id: account.id, username: account.username }
      });

      return { ok: true };
    },
    [updateAuthState]
  );

  const register = useCallback(
    (username: string, password: string): AuthResult => {
      const cleanUsername = username.trim();

      if (cleanUsername.length < 3) return { ok: false, message: "Tài khoản cần ít nhất 3 ký tự" };
      if (password.length < 6) return { ok: false, message: "Mật khẩu cần ít nhất 6 ký tự" };

      const existed = cachedState.accounts.some((item) => item.username.toLowerCase() === cleanUsername.toLowerCase());
      if (existed) return { ok: false, message: "Tài khoản đã tồn tại" };

      const account: Account = { id: createId(), username: cleanUsername, password };

      void updateAuthState({
        accounts: [account, ...cachedState.accounts],
        user: { id: account.id, username: account.username }
      });

      return { ok: true };
    },
    [updateAuthState]
  );

  const logout = useCallback(() => {
    void updateAuthState({ ...cachedState, user: null });
  }, [updateAuthState]);

  return { user: state.user, isLoading, login, register, logout };
}
