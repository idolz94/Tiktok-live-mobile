import {
  Profile,
  Shop,
  ShopLicense,
  ShopMember,
  ShopTikTokChannel,
} from "@app-types/database";
import { AuthUser } from "@app-types/index";

export interface AuthStoreState {
  user: AuthUser | null;
  isRemembered: boolean;
  lastUsername?: string;
  logout: () => void;
  setUserFromBootstrap: (user: AuthUser | null) => void;
  setLoginState: (username: string, remember: boolean) => void;
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
  hasOrders: boolean;
  hasHistory: boolean;
};
