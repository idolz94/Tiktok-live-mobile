type Listener = () => void;
const listeners = new Set<Listener>();
let hasEmittedSessionExpired = false;

/**
 * sessionExpiredEmitter - Event Emitter tối giản dành cho sự kiện hết hạn phiên đăng nhập
 *
 * Tại sao thiết kế độc lập?
 *   - Tránh circular dependency (vòng lặp import) giữa axios.ts và store/hooks.
 *   - Chỉ phát event một lần duy nhất nhờ cờ hasEmittedSessionExpired (chống spam Alert khi nhiều API đồng thời trả về 401).
 */
export const sessionExpiredEmitter = {
  // Đăng ký nhận sự kiện
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // Phát ra sự kiện hết hạn
  emit() {
    if (hasEmittedSessionExpired) return;
    hasEmittedSessionExpired = true;
    listeners.forEach((listener) => listener());
  },

  // Reset trạng thái cờ chống phát lặp
  reset() {
    hasEmittedSessionExpired = false;
  },
};
