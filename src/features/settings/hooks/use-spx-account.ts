import { useEffect } from "react";
import { useSpxAccountStore } from "../stores/spx-account-store";

export function useSpxAccount() {
  const connected = useSpxAccountStore((s) => s.connected);
  const submitting = useSpxAccountStore((s) => s.submitting);
  const initialized = useSpxAccountStore((s) => s.initialized);
  const initialize = useSpxAccountStore((s) => s.initialize);
  const connect = useSpxAccountStore((s) => s.connect);
  const disconnect = useSpxAccountStore((s) => s.disconnect);

  useEffect(() => {
    if (!initialized) {
      void initialize();
    }
  }, [initialized, initialize]);

  return {
    connected,
    loading: !initialized,
    submitting,
    connect,
    disconnect,
  };
}
