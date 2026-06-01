import { useCallback, useEffect, useRef, useState } from "react";
import EventSource from "react-native-sse";
import { TIKTOK_USERNAME } from "@constants/config";
import { useTikTokComments } from "@features/tiktok-live/use-tik-tok-comments";
import { useTikTokLiveSession } from "@features/tiktok-live/use-tik-tok-live-session";
import {
  getSseBaseUrl,
  stopTikTokLiveApi,
  subscribeTikTokLiveApi,
} from "@features/tiktok-live/sse-api";
import { normalizeTikTokUsername } from "@utils/comment";
import httpClient from "@utils/http/axios";

const createClientId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const useTikTokLiveSocket = () => {
  const eventSourceRef = useRef<any>(null);
  const clientIdRef = useRef(createClientId());
  const isManualCloseRef = useRef(false);
  const tiktokUsernameRef = useRef(normalizeTikTokUsername(TIKTOK_USERNAME));

  const [status, setStatus] = useState("Đang kết nối server SSE...");
  const [isConnected, setIsConnected] = useState(false);
  const [tiktokUsername, setTikTokUsername] = useState(
    normalizeTikTokUsername(TIKTOK_USERNAME),
  );

  const {
    comments,
    setComments,
    addCommentToList,
    replaceSnapshot,
    clearComments,
  } = useTikTokComments();

  const {
    currentLiveSession,
    liveHistory,
    liveDurationSeconds,
    liveNowText,
    clearLiveHistory,
    finalizeCurrentSessionLocally,
    startSessionFromPayload,
    endSessionFromPayload,
    updateSessionStatusFromPayload,
    addCommentToCurrentSession,
  } = useTikTokLiveSession();

  const handleServerEvent = useCallback(
    (type: string, payload: Record<string, any>) => {
      if (type === "CONNECTED") {
        setStatus("Đã kết nối server SSE");
        setIsConnected(true);
        return;
      }

      if (type === "SUBSCRIBING") {
        setStatus(`Đang chuẩn bị lấy comment LIVE: ${payload.username || ""}`);
        return;
      }

      if (type === "SUBSCRIBED") {
        const username = payload.username || payload.tiktokUsername || "";
        if (username) {
          tiktokUsernameRef.current = username;
          setTikTokUsername(username);
        }

        const snapshot = payload.comments || [];
        replaceSnapshot(Array.isArray(snapshot) ? snapshot : []);
        setStatus(
          `Đã subscribe LIVE ${username}, đang chờ comment đầu tiên...`,
        );
        return;
      }

      if (type === "LIVE_TIME_STARTED") {
        startSessionFromPayload(payload);
        setStatus(`Bắt đầu phiên nhận comment: ${payload.username || ""}`);
        return;
      }

      if (type === "LIVE_TIME_ENDED") {
        void endSessionFromPayload(payload);
        setStatus(`Đã lưu phiên LIVE: ${payload.username || ""}`);
        return;
      }

      if (type === "LIVE_TIME_STATUS") {
        updateSessionStatusFromPayload(payload);
        return;
      }

      if (type === "UNSUBSCRIBED") {
        void finalizeCurrentSessionLocally("unsubscribed");
        setComments([]);
        setStatus(`Đã rời LIVE: ${payload.username || ""}`);
        return;
      }

      if (type === "LIVE_CONNECTED") {
        setStatus(`Đã kết nối TikTok Live: ${payload.username || ""}`);
        return;
      }

      if (type === "LIVE_DISCONNECTED") {
        void finalizeCurrentSessionLocally("live_disconnected");
        setStatus(`TikTok Live đã ngắt: ${payload.username || ""}`);
        return;
      }

      if (type === "LIVE_ERROR") {
        void finalizeCurrentSessionLocally("live_error");
        setStatus(
          `TikTok lỗi ${payload.username || ""}: ${payload.message || "Không rõ lỗi"}`,
        );
        return;
      }

      if (type === "SNAPSHOT") {
        const snapshot = payload.comments || [];
        replaceSnapshot(Array.isArray(snapshot) ? snapshot : []);
        return;
      }

      if (type === "COMMENT") {
        const comment = addCommentToList(payload);
        if (comment) addCommentToCurrentSession(comment);
      }
    },
    [
      addCommentToCurrentSession,
      addCommentToList,
      endSessionFromPayload,
      finalizeCurrentSessionLocally,
      replaceSnapshot,
      setComments,
      startSessionFromPayload,
      updateSessionStatusFromPayload,
    ],
  );

  const handleEventSourceMessage = useCallback(
    (type: string, event: any) => {
      try {
        const payload = JSON.parse(String(event.data || "{}"));
        handleServerEvent(type, payload);
      } catch (error) {
        console.log("SSE parse error:", error);
      }
    },
    [handleServerEvent],
  );

  const connectSse = useCallback(() => {
    const baseUrl = getSseBaseUrl();
    const clientId = clientIdRef.current;

    if (!baseUrl) {
      setStatus("Thiếu SSE URL");
      return;
    }

    isManualCloseRef.current = false;
    eventSourceRef.current?.close?.();

    const eventSource = new (EventSource as any)(
      `${baseUrl}/events?clientId=${encodeURIComponent(clientId)}`,
    );
    eventSourceRef.current = eventSource;

    const eventTypes = [
      "CONNECTED",
      "SUBSCRIBING",
      "SUBSCRIBED",
      "LIVE_TIME_STARTED",
      "LIVE_TIME_ENDED",
      "LIVE_TIME_STATUS",
      "UNSUBSCRIBED",
      "LIVE_CONNECTED",
      "LIVE_DISCONNECTED",
      "LIVE_ERROR",
      "SNAPSHOT",
      "COMMENT",
    ];

    eventTypes.forEach((eventType) => {
      eventSource.addEventListener(eventType, (event: any) =>
        handleEventSourceMessage(eventType, event),
      );
    });

    eventSource.addEventListener("open", () => {
      setIsConnected(true);
      setStatus("Đã kết nối server SSE");
    });

    eventSource.addEventListener("error", () => {
      if (isManualCloseRef.current) return;
      setIsConnected(false);
      setStatus("SSE mất kết nối...");
    });
  }, [handleEventSourceMessage]);

  /**
   * Ping server trước để wake up Render free tier (có thể ngủ sau 15 phút idle),
   * sau đó mới mở SSE connection.
   * Lỗi ping được bỏ qua — mục đích chỉ là đánh thức server.
   */
  const wakeUpAndConnect = useCallback(async () => {
    setStatus("Đang kết nối server...");
    try {
      await httpClient.get("/health");
    } catch {
      // Server có thể không có /health — bỏ qua lỗi, vẫn tiếp tục
    }
    connectSse();
  }, [connectSse]);

  const subscribeTikTokUsername = useCallback(
    async (username: string) => {
      const nextUsername = normalizeTikTokUsername(username);
      if (!nextUsername) {
        setStatus("Vui lòng nhập TikTok username");
        return false;
      }

      const oldUsername = tiktokUsernameRef.current;
      if (oldUsername && oldUsername !== nextUsername) {
        await finalizeCurrentSessionLocally("change_username");
      }

      tiktokUsernameRef.current = nextUsername;
      setTikTokUsername(nextUsername);
      setComments([]);
      setStatus(`Đang subscribe LIVE ${nextUsername}...`);

      try {
        await subscribeTikTokLiveApi({
          clientId: clientIdRef.current,
          username: nextUsername,
        });
        return true;
      } catch (error) {
        console.log("SUBSCRIBE SSE ERROR:", error);
        setStatus("Không gọi được API subscribe Python");
        return false;
      }
    },
    [finalizeCurrentSessionLocally, setComments],
  );

  const stopLiveSession = useCallback(async () => {
    setStatus("Đang dừng nhận comment...");

    try {
      await stopTikTokLiveApi(clientIdRef.current);
    } catch (error) {
      console.log("STOP SSE ERROR:", error);
    }

    await finalizeCurrentSessionLocally("manual_stop");
    return true;
  }, [finalizeCurrentSessionLocally]);

  const reconnect = useCallback(() => {
    void finalizeCurrentSessionLocally("manual_reconnect");
    isManualCloseRef.current = false;
    eventSourceRef.current?.close?.();
    eventSourceRef.current = null;
    // Wake up server trước khi reconnect (server có thể đã ngủ)
    void wakeUpAndConnect();
  }, [wakeUpAndConnect, finalizeCurrentSessionLocally]);

  const disconnect = useCallback(async () => {
    await finalizeCurrentSessionLocally("manual_disconnect");
    isManualCloseRef.current = true;

    try {
      await stopTikTokLiveApi(clientIdRef.current);
    } catch (error) {
      console.log("DISCONNECT SSE ERROR:", error);
    }

    eventSourceRef.current?.close?.();
    eventSourceRef.current = null;
    setIsConnected(false);
    setStatus("Đã ngắt kết nối");
  }, [finalizeCurrentSessionLocally]);

  useEffect(() => {
    // Ping server để wake up trước, sau đó mới mở SSE
    void wakeUpAndConnect();

    return () => {
      void finalizeCurrentSessionLocally("component_unmount");
      isManualCloseRef.current = true;
      void stopTikTokLiveApi(clientIdRef.current).catch(() => undefined);
      eventSourceRef.current?.close?.();
      eventSourceRef.current = null;
    };
  }, [wakeUpAndConnect, finalizeCurrentSessionLocally]);

  return {
    status,
    isConnected,
    comments,
    tiktokUsername,
    currentLiveSession,
    liveHistory,
    liveDurationSeconds,
    liveNowText,
    setComments,
    clearComments,
    clearLiveHistory,
    reconnect,
    disconnect,
    stopLiveSession,
    changeTikTokUsername: subscribeTikTokUsername,
    subscribeTikTokUsername,
  };
};
