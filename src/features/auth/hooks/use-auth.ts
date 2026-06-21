import {
  getMeBootstrapApi,
  loginApi,
  registerApi,
} from "@features/auth/services/api";
import {
  extractAccessToken,
  extractRefreshToken,
  refreshAccessToken,
} from "@utils/http/auth-session";
import { useAuthStore } from "@features/auth/stores";
import { mapBootstrapToAuthUser } from "@features/auth/stores/auth-utils";
import { secureStorage } from "@utils/storage";
import { useCallback, useEffect, useMemo, useState } from "react";

type BootstrapOptions = {
  background?: boolean;
  setUserFromBootstrap: (user: any) => void;
  setError: (error: string | null) => void;
};

type LoginParams = {
  username: string;
  password: string;
  remember: boolean;
};

type RegisterParams = {
  username: string;
  password: string;
  fullName: string;
  tiktokId: string;
};

async function bootstrapAuth({
  background = false,
  setUserFromBootstrap,
  setError,
}: BootstrapOptions): Promise<void> {
  try {
    setError(null);
    const response = await getMeBootstrapApi();

    const authUser = mapBootstrapToAuthUser(response);

    setUserFromBootstrap(authUser);
  } catch (error) {
    if (!background) {
      setUserFromBootstrap(null);
    }
    setError(
      error instanceof Error ? error.message : "Không thể tải thông tin tài khoản",
    );
  }
}

// Module-level guards: ensure /me/bootstrap is called at most once across all useAuth instances.
// Multiple components (layout, tabs, tiktok-page…) mount simultaneously and each would fire the
// same effect — without these flags every mount triggers a redundant bootstrap call.
let bootstrapInFlight = false;
let bootstrapDone = false;

export const resetBootstrapGuard = () => {
  bootstrapInFlight = false;
  bootstrapDone = false;
};

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);
  const setLoginState = useAuthStore((state) => state.setLoginState);
  const setUserFromBootstrap = useAuthStore(
    (state) => state.setUserFromBootstrap,
  );

  const [isHydrated, setIsHydrated] = useState(
    useAuthStore.persist.hasHydrated(),
  );
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (bootstrapDone || bootstrapInFlight) return;

    const run = async () => {
      const accessToken = await secureStorage.getAccessToken();

      if (!accessToken) {
        setUserFromBootstrap(null);
        setIsBootstrapping(false);
        return;
      }

      bootstrapInFlight = true;
      setIsBootstrapping(true);
      try {
        await bootstrapAuth({
          background: false,
          setUserFromBootstrap,
          setError,
        });
        bootstrapDone = true;
      } finally {
        bootstrapInFlight = false;
        setIsBootstrapping(false);
      }
    };

    void run();
  }, [isHydrated, setUserFromBootstrap]);

  const login = useCallback(
    async ({ username, password, remember }: LoginParams) => {
      setIsBootstrapping(true);
      try {
        const response = await loginApi({ username, password });
        const accessToken = extractAccessToken(response);
        const refreshToken = extractRefreshToken(response);

        if (!accessToken) {
          throw new Error("Không tìm thấy access token từ server");
        }

        await secureStorage.setAccessToken(accessToken);
        if (refreshToken) {
          await secureStorage.setRefreshToken(refreshToken);
        }

        setLoginState(username.trim(), remember);
        resetBootstrapGuard();
        bootstrapInFlight = true;
        try {
          await bootstrapAuth({ background: false, setUserFromBootstrap, setError });
          bootstrapDone = true;
        } finally {
          bootstrapInFlight = false;
        }
      } finally {
        setIsBootstrapping(false);
      }
    },
    [setLoginState, setUserFromBootstrap],
  );

  const register = useCallback(async ({ username, password, fullName, tiktokId }: RegisterParams) => {
    const response = await registerApi({
      username,
      password,
      fullName,
      tiktokId,
    });

    return response.data?.data ?? response.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsBootstrapping(true);
      await logoutStore();
      setUserFromBootstrap(null);
      resetBootstrapGuard();
    } catch (err) {
      console.warn("Lỗi đăng xuất:", err);
    } finally {
      setIsBootstrapping(false);
    }
  }, [logoutStore, setUserFromBootstrap]);

  const refreshAuth = useCallback(async ({ force = false }: { force?: boolean } = {}) => {
    if (!force && !user) return;
    if (bootstrapInFlight) return;

    bootstrapInFlight = true;
    setIsBootstrapping(true);

    try {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.warn("Không thể refresh token:", error);
      }

      await bootstrapAuth({ background: Boolean(user), setUserFromBootstrap, setError });
      bootstrapDone = true;
    } finally {
      bootstrapInFlight = false;
      setIsBootstrapping(false);
    }
  }, [user, setUserFromBootstrap]);

  const mergedUser = useMemo(() => user, [user]);

  return {
    user: mergedUser,
    isLoading: !isHydrated || isBootstrapping,
    error,
    login,
    register,
    logout,
    refreshAuth,
  };
};
