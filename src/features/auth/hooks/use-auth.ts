import {
  useAuth as useClerkAuth,
  useUser as useClerkUser,
} from "@clerk/clerk-expo";
import { getMeBootstrapApi } from "@features/auth/services/api";
import { useAuthStore } from "@features/auth/stores";
import { mapBootstrapToAuthUser } from "@features/auth/stores/auth-utils";
import { useCallback, useEffect, useMemo, useState } from "react";

let bootstrapInFlight: Promise<void> | null = null;
let bootstrappedUserId: string | null = null;

type BootstrapOptions = {
  background?: boolean;
  setUserFromBootstrap: (user: any) => void;
  setError: (error: string | null) => void;
};

async function bootstrapAuth({
  background = false,
  setUserFromBootstrap,
  setError,
}: BootstrapOptions): Promise<void> {
  if (bootstrapInFlight) {
    return bootstrapInFlight;
  }

  bootstrapInFlight = (async () => {
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
        error instanceof Error
          ? error.message
          : "Không thể tải thông tin tài khoản",
      );
    } finally {
      bootstrapInFlight = null;
    }
  })();

  return bootstrapInFlight;
}

export const useAuth = () => {
  const { isLoaded: isClerkLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user: clerkUser, isLoaded: isClerkUserLoaded } = useClerkUser();

  const user = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);
  const setUserFromBootstrap = useAuthStore(
    (state) => state.setUserFromBootstrap,
  );

  const [isHydrated, setIsHydrated] = useState(
    useAuthStore.persist.hasHydrated(),
  );
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Chờ Zustand store hydrate từ MMKV
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

  // 2. Đồng bộ trạng thái đăng nhập từ Clerk sang Backend
  useEffect(() => {
    if (!isHydrated || !isClerkLoaded || !isClerkUserLoaded) return;

    if (!isSignedIn) {
      setUserFromBootstrap(null);
      bootstrappedUserId = null;
      setIsBootstrapping(false);
      return;
    }

    const clerkUserId = clerkUser?.id || null;
    const hasBootstrappedCurrentUser = bootstrappedUserId === clerkUserId;

    if (!hasBootstrappedCurrentUser && !bootstrapInFlight) {
      setIsBootstrapping(true);
      bootstrapAuth({ background: false, setUserFromBootstrap, setError })
        .then(() => {
          bootstrappedUserId = clerkUserId;
        })
        .finally(() => {
          setIsBootstrapping(false);
        });
    }
  }, [
    isHydrated,
    isClerkLoaded,
    isClerkUserLoaded,
    isSignedIn,
    clerkUser?.id,
    setUserFromBootstrap,
  ]);

  const logout = useCallback(async () => {
    try {
      setIsBootstrapping(true);
      await signOut();
      await logoutStore();
      bootstrappedUserId = null;
    } catch (err) {
      console.warn("Lỗi đăng xuất:", err);
    } finally {
      setIsBootstrapping(false);
    }
  }, [signOut, logoutStore]);

  const refreshAuth = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      if (!force && !isSignedIn) return;
      setIsBootstrapping(true);
      await bootstrapAuth({
        background: Boolean(user),
        setUserFromBootstrap,
        setError,
      });
      bootstrappedUserId = clerkUser?.id || null;
      setIsBootstrapping(false);
    },
    [isSignedIn, clerkUser?.id, setUserFromBootstrap, user],
  );

  // Hợp nhất dữ liệu Clerk User (Tên, Email) và dữ liệu Shop/License từ Backend
  // Dùng useMemo để tránh tạo object reference mới mỗi render
  // → ngăn infinite loop ở các component phụ thuộc vào user object (e.g. channelOptions useMemo)
  const mergedUser = useMemo(() => {
    if (!clerkUser) return null;
    return {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || null,
      fullName: clerkUser.fullName || null,
      phone: clerkUser.username || null,
      ...(user || {}),
    };
  }, [
    clerkUser?.id,
    clerkUser?.primaryEmailAddress?.emailAddress,
    clerkUser?.fullName,
    clerkUser?.username,
    user,
  ]);

  return {
    user: mergedUser,
    isLoading:
      !isHydrated || !isClerkLoaded || !isClerkUserLoaded || isBootstrapping,
    error,
    logout,
    refreshAuth,
  };
};
