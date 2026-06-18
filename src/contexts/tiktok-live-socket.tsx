import { useTikTokLiveSocket } from "@modules/tiktok-live/hooks/use-tiktok-live-socket";
import { createContext, ReactNode, useContext } from "react";

type LiveSocketType = ReturnType<typeof useTikTokLiveSocket>;

type TikTokLiveSocketProviderProps = {
  children: ReactNode;
  hasHistory?: boolean;
};

const TikTokLiveSocketContext = createContext<LiveSocketType | null>(null);

export function TikTokLiveSocketProvider({
  children,
  hasHistory,
}: TikTokLiveSocketProviderProps) {
  const socketValue = useTikTokLiveSocket({ hasHistory });

  return (
    <TikTokLiveSocketContext.Provider value={socketValue}>
      {children}
    </TikTokLiveSocketContext.Provider>
  );
}

export function useTikTokLiveSocketContext() {
  const context = useContext(TikTokLiveSocketContext);
  if (!context) {
    throw new Error(
      "useTikTokLiveSocketContext phải được sử dụng bên trong TikTokLiveSocketProvider",
    );
  }
  return context;
}
