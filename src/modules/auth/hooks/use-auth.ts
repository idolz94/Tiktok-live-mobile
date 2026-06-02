import { useAuthStore } from "@stores/auth";
import { useEffect, useState } from "react";

let hasCheckedStartup = false;

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isRemembered = useAuthStore((state) => state.isRemembered);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);

  const [isHydrated, setIsHydrated] = useState(
    useAuthStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (hasCheckedStartup) {
      setIsHydrated(true);
      return;
    }

    const checkStartupAuth = () => {
      hasCheckedStartup = true;

      if (user && !isRemembered) {
        logout();
      }
    };

    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
      checkStartupAuth();
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
      checkStartupAuth();
    });

    return unsub;
  }, []);

  return {
    user,
    isLoading: !isHydrated,
    login,
    register,
    logout,
  };
};
