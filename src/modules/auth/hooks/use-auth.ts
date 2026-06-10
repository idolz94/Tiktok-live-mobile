import { useAuthStore } from "@stores/auth";
import { getMeBootstrapApi } from "@modules/auth/services/api";
import { mapBootstrapToAuthUser } from "@stores/auth/auth-utils";
import { secureStorage } from "@utils/storage";
import { useCallback, useEffect, useState } from "react";
import type { LoginForm } from "src/schemas/auth";
import { sessionExpiredEmitter } from "@utils/http/session-event";

// ─────────────────────────────────────────────────────────────────────────────
// Biến module-level — tồn tại suốt vòng đời của app.
//
// Tại sao để ngoài component?
//   → Nếu để trong state/ref, mỗi lần component unmount/remount là reset.
//   → Module-level variables chỉ được khởi tạo 1 lần khi app load.
//
// bootstrapInFlight → Promise đang chạy. Nếu 3 screen cùng mount useAuth(),
//                     getMeBootstrapApi() vẫn chỉ được gọi ĐÚNG 1 LẦN.
// bootstrapDone     → Đã xong chưa? Nếu rồi thì skip, không gọi lại.
// ─────────────────────────────────────────────────────────────────────────────
let bootstrapInFlight: Promise<void> | null = null;
let bootstrapDone = false;

/**
 * bootstrapAuth — Hàm core của toàn bộ auth flow khi app khởi động.
 *
 * Luồng:
 *   1. Kiểm tra token trong SecureStore
 *      → Không có: set user = null (chưa login) → xong
 *   2. Có token → gọi GET /me/bootstrap
 *      → 401/403: EMPTY_ME → user = null (token hết hạn)
 *      → 200 OK : map response → AuthUser → ghi vào Zustand store
 *      → Network/500: giữ user cũ (không đá ra màn login khi mất mạng)
 *
 * IN-FLIGHT GUARD: Nếu promise đang chạy → trả về promise cũ luôn.
 * Đảm bảo API không bị gọi 2 lần dù nhiều component mount đồng thời.
 *
 * Tại sao hàm này ở use-auth.ts chứ không ở auth-store.ts?
 *   → auth-store.ts import api.ts, api.ts import @stores/auth → circular import!
 *   → use-auth.ts là hook layer, có thể import cả store lẫn api mà không circular.
 */
async function bootstrapAuth(
  setUserFromBootstrap: (
    user: ReturnType<typeof mapBootstrapToAuthUser>,
  ) => void,
): Promise<void> {
  if (bootstrapInFlight) return bootstrapInFlight; // ← guard: không gọi API 2 lần

  bootstrapInFlight = (async () => {
    try {
      // Bước 1: Kiểm tra token trước — tránh gọi API vô ích khi chưa login
      const token = await secureStorage.getAccessToken();

      if (!token) {
        // Không có token → không cần gọi API → set null luôn
        setUserFromBootstrap(null);
        return;
      }

      // Bước 2: Có token → gọi /me/bootstrap để verify và lấy đầy đủ thông tin
      // Token được tự động đính kèm trong getRequest() (đọc từ SecureStore)
      // Nếu 401/403 → getMeBootstrapApi() trả về EMPTY_ME thay vì throw
      const response = await getMeBootstrapApi();

      // Bước 3: Map response thô → AuthUser format gọn → lưu vào store
      const authUser = mapBootstrapToAuthUser(response);
      setUserFromBootstrap(authUser);
    } catch (error) {
      // Lỗi network / 500: KHÔNG xóa user cũ!
      // Lý do: mất mạng tạm thời khi mở app → không nên đá user ra màn login
      // → giữ nguyên data cũ đã persist trong MMKV
      console.warn(
        "[useAuth] Bootstrap thất bại, giữ user cũ trong store:",
        error,
      );
    } finally {
      bootstrapDone = true;
      bootstrapInFlight = null; // Dọn dẹp để refreshAuth() có thể gọi lại sau
    }
  })();

  return bootstrapInFlight;
}

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const loginAction = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const setUserFromBootstrap = useAuthStore(
    (state) => state.setUserFromBootstrap,
  );

  // isHydrated: Zustand đã đọc xong data từ MMKV chưa?
  // Phải đợi bước này trước — nếu bootstrap xong trước MMKV hydrate,
  // MMKV có thể overwrite kết quả của bootstrap.
  const [isHydrated, setIsHydrated] = useState(
    useAuthStore.persist.hasHydrated(),
  );

  // isBootstrapping: đang gọi /me/bootstrap không?
  // isLoading = !isHydrated || isBootstrapping
  const [isBootstrapping, setIsBootstrapping] = useState(!bootstrapDone);

  // ─── Bước 1: Đợi Zustand hydrate từ MMKV ────────────────────────────────
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

  // ─── Bước 2: Sau khi hydrate → chạy bootstrap ───────────────────────────
  useEffect(() => {
    if (!isHydrated) return;

    if (bootstrapDone) {
      setIsBootstrapping(false);
      return;
    }

    setIsBootstrapping(true);
    bootstrapAuth(setUserFromBootstrap).finally(() => {
      setIsBootstrapping(false);
    });
  }, [isHydrated, setUserFromBootstrap]);

  /**
   * login — Wrapper quanh store action.
   *
   * Tại sao wrap ở đây thay vì trong store?
   *   1. Tránh circular import (store → api → store)
   *   2. useAuth là nơi quản lý toàn bộ auth lifecycle — đây là chỗ phù hợp
   *
   * Luồng:
   *   loginAction() → loginApi() → token saved to SecureStore
   *   Nếu ok → reset bootstrapDone → bootstrapAuth() → GET /me/bootstrap
   *          → mapBootstrapToAuthUser() → setUserFromBootstrap()
   *          → user được populate đầy đủ (shop, license, tiktokChannels,...)
   */
  const login = useCallback(
    async (data: LoginForm) => {
      // Phase 1: loginAction → set user cơ bản từ login response → navigate ngay
      const result = await loginAction(data);

      if (result.ok) {
        // Reset cờ session expired khi đăng nhập thành công
        sessionExpiredEmitter.reset();

        // Phase 2: Enrich user data với shop/license/tiktokChannels từ /me/bootstrap
        // Fire-and-forget — KHÔNG await để không block navigation
        // Khi bootstrap xong, Zustand tự notify → UI update (banner license, shop info,...)
        bootstrapDone = false;
        bootstrapAuth(setUserFromBootstrap).catch((err) => {
          console.warn("[useAuth] Post-login bootstrap thất bại:", err);
        });
      }

      return result;
    },
    [loginAction, setUserFromBootstrap],
  );

  /**
   * refreshAuth — Force gọi lại /me/bootstrap để lấy data mới nhất.
   *
   * Dùng khi nào?
   *   - Sau khi user cập nhật thông tin shop
   *   - Sau khi thêm/xóa kênh TikTok
   *   - Sau khi mua/gia hạn license
   */
  const refreshAuth = useCallback(async () => {
    bootstrapDone = false;
    setIsBootstrapping(true);
    await bootstrapAuth(setUserFromBootstrap);
    setIsBootstrapping(false);
  }, [setUserFromBootstrap]);

  return {
    user,
    isLoading: !isHydrated || isBootstrapping,
    login, // ← wrapped version (gọi bootstrap sau login)
    register,
    logout,
    refreshAuth,
  };
};
