import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/clerk-expo";
import { useAuthStore } from "@stores/auth";
import { getMeBootstrapApi } from "@modules/auth/services/api";
import { mapBootstrapToAuthUser } from "@stores/auth/auth-utils";
import { useCallback, useEffect, useMemo, useState } from "react";

let bootstrapInFlight: Promise<void> | null = null;
let bootstrappedUserId: string | null = null;

async function bootstrapAuth(
  setUserFromBootstrap: (user: any) => void,
): Promise<void> {
  if (bootstrapInFlight) return bootstrapInFlight;

  bootstrapInFlight = (async () => {
    try {
      const response = await getMeBootstrapApi();
      const authUser = mapBootstrapToAuthUser(response);
      setUserFromBootstrap(authUser);
    } catch (error) {
      console.warn(
        "[useAuth] Bootstrap thất bại, giữ user cũ trong store:",
        error,
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
      // Nếu Clerk đã đăng xuất -> Clear user ở Zustand store
      if (user !== null) {
        setUserFromBootstrap(null);
      }
      bootstrappedUserId = null;
      setIsBootstrapping(false);
      return;
    }

    // Nếu Clerk đã đăng nhập -> Đồng bộ thông tin từ Backend
    const clerkUserId = clerkUser?.id || null;
    const hasBootstrappedCurrentUser = bootstrappedUserId === clerkUserId;

    if (isSignedIn && !hasBootstrappedCurrentUser && !bootstrapInFlight) {
      setIsBootstrapping(true);
      bootstrapAuth(setUserFromBootstrap)
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
    user,
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
      await bootstrapAuth(setUserFromBootstrap);
      bootstrappedUserId = clerkUser?.id || null;
      setIsBootstrapping(false);
    },
    [isSignedIn, clerkUser?.id, setUserFromBootstrap],
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
    logout,
    refreshAuth,
  };
};
