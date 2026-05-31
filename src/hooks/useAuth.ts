import { useEffect, useState } from "react";
import { useAuthStore } from "@stores/auth/auth-store";

export type AuthResult = { ok: boolean; message?: string };

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);

  // Theo dõi trạng thái đã load xong dữ liệu từ AsyncStorage chưa
  const [isHydrated, setIsHydrated] = useState(
    useAuthStore.persist.hasHydrated(),
  );

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

  return {
    user,
    isLoading: !isHydrated,
    login,
    register,
    logout,
  };
}
export default useAuth;
