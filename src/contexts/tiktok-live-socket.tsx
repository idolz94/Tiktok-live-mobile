import { useTikTokLiveSocket } from "@modules/tiktok-live/hooks/use-tiktok-live-socket";
import React, { createContext, useContext } from "react";

type LiveSocketType = ReturnType<typeof useTikTokLiveSocket>;

const TikTokLiveSocketContext = createContext<LiveSocketType | null>(null);

export function TikTokLiveSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Chỉ khởi tạo 1 instance duy nhất tại Provider này
  const socketValue = useTikTokLiveSocket();

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
