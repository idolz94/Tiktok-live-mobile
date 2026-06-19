import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { setClerkGetToken } from "@utils/http/clerk-token-bridge";

export const ClerkTokenSync = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    setClerkGetToken(getToken);
    return () => {
      setClerkGetToken(null);
    };
  }, [getToken]);

  return null;
};
