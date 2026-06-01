import { LoginForm, RegisterForm } from "@screens/auth/type";
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
  isRemembered: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (data: LoginForm) => Promise<AuthResult>;
  register: (data: RegisterForm) => Promise<AuthResult>;
  logout: () => void;
}
