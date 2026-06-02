import { useTikTokLiveSocket } from "@modules/tiktok-live/use-tiktok-live-socket";
import { createContext, useContext, type ReactNode } from "react";

type LiveSocketValue = ReturnType<typeof useTikTokLiveSocket>;
const LiveSocketContext = createContext<LiveSocketValue | null>(null);

export const LiveSocketProvider = ({ children }: { children: ReactNode }) => {
  const value = useTikTokLiveSocket(); // gọi 1 lần duy nhất
  return (
    <LiveSocketContext.Provider value={value}>
      {children}
    </LiveSocketContext.Provider>
  );
};

export const useLiveSocket = (): LiveSocketValue => {
  const ctx = useContext(LiveSocketContext);
  if (!ctx) throw new Error("useLiveSocket must be inside LiveSocketProvider");
  return ctx;
};
