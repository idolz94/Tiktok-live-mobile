import { AuthUser } from "@types";

export type Account = {
  id: string;
  username: string;
  password: string;
};

export interface AuthResult {
  ok: boolean;
  message?: string;
}

export interface AuthStoreState {
  accounts: Account[];
  user: AuthUser | null;
  login: (username: string, password: string) => AuthResult;
  register: (username: string, password: string) => AuthResult;
  logout: () => void;
}
