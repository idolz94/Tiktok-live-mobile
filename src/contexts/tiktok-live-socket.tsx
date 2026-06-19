import { useTikTokLiveSocket } from "@modules/tiktok-live/hooks/use-tiktok-live-socket";
import { createContext, ReactNode, useContext, useMemo } from "react";

type LiveSocketType = ReturnType<typeof useTikTokLiveSocket>;
type StableSocketType = Omit<LiveSocketType, "liveDurationSeconds" | "liveNowText">;

type TimerContextType = {
  liveDurationSeconds: number;
  liveNowText: string;
};

type TikTokLiveSocketProviderProps = {
  children: ReactNode;
  hasHistory?: boolean;
};

const TikTokLiveSocketContext = createContext<StableSocketType | null>(null);
const TikTokLiveTimerContext = createContext<TimerContextType | null>(null);

export function TikTokLiveSocketProvider({
  children,
  hasHistory,
}: TikTokLiveSocketProviderProps) {
  const socketValue = useTikTokLiveSocket({ hasHistory });
  const { liveDurationSeconds, liveNowText, ...socketRest } = socketValue;

  const stableSocketValue = useMemo(
    () => socketRest,
    [
      socketRest.status,
      socketRest.isConnected,
      socketRest.isConnecting,
      socketRest.comments,
      socketRest.tiktokUsername,
      socketRest.liveError,
      socketRest.viewersCount,
      socketRest.currentLiveSession,
      socketRest.currentLiveSessionId,
      socketRest.liveHistory,
      socketRest.setComments,
      socketRest.clearComments,
      socketRest.clearLiveHistory,
      socketRest.reloadLiveHistory,
      socketRest.reconnect,
      socketRest.disconnect,
      socketRest.stopLiveSession,
      socketRest.clearLiveError,
      socketRest.changeTikTokUsername,
      socketRest.subscribeTikTokUsername,
    ],
  );

  const timerValue = useMemo(
    () => ({ liveDurationSeconds, liveNowText }),
    [liveDurationSeconds, liveNowText],
  );

  return (
    <TikTokLiveSocketContext.Provider value={stableSocketValue}>
      <TikTokLiveTimerContext.Provider value={timerValue}>
        {children}
      </TikTokLiveTimerContext.Provider>
    </TikTokLiveSocketContext.Provider>
  );
}

export function useTikTokLiveSocketContext() {
  const context = useContext(TikTokLiveSocketContext);
  if (!context) {
    throw new Error(
      "useTikTokLiveSocketContext must be used inside TikTokLiveSocketProvider",
    );
  }
  return context;
}

export function useTikTokLiveTimerContext() {
  const context = useContext(TikTokLiveTimerContext);
  if (!context) {
    throw new Error(
      "useTikTokLiveTimerContext must be used inside TikTokLiveSocketProvider",
    );
  }
  return context;
}
