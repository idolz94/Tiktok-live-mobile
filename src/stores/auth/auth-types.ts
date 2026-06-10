import {
  Profile,
  Shop,
  ShopLicense,
  ShopMember,
  ShopTikTokChannel,
} from "@app-types/database";
import { AuthUser } from "@app-types/index";
import { LoginForm, RegisterForm } from "src/schemas/auth";

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
  login: (data: LoginForm) => Promise<AuthResult>;
  register: (data: RegisterForm) => Promise<AuthResult>;
  logout: () => void;
  // Được gọi bởi bootstrap flow để cập nhật user sau khi GET /me/bootstrap thành công.
  // Không cần credentials, chỉ cần kết quả đã map từ mapBootstrapToAuthUser().
  setUserFromBootstrap: (user: AuthUser | null) => void;
}

export type BootstrapUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any>;
  metadata?: Record<string, any>;
  [key: string]: any;
};

export type MeBootstrapResponse = {
  user: BootstrapUser | null;
  profile: Profile | null;
  shopMember: ShopMember | null;
  shop: Shop | null;
  license: ShopLicense | null;
  tiktokChannels: ShopTikTokChannel[];
  canUseApp: boolean;
  reason?: string | null;
};
