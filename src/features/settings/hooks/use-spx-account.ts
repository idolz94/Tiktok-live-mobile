import { useEffect, useState } from "react";
import { createSpxAccountApi, getSpxAccountApi } from "../service/spx-account-api";

export function useSpxAccount() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void getSpxAccountApi()
      .then((r) => setConnected(r.connected))
      .finally(() => setLoading(false));
  }, []);

  async function connect(data: { phone: string; email?: string }): Promise<boolean> {
    setSubmitting(true);
    try {
      await createSpxAccountApi(data);
      setConnected(true);
      return true;
    } catch {
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return { connected, loading, submitting, connect };
}
