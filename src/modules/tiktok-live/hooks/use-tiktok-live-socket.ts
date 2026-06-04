import { TIKTOK_USERNAME } from "@constants/config";
import {
  normalizeTikTokUsername,
  unwrapSseCommentPayload,
} from "@utils/comment";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTikTokComments } from "./use-tik-tok-comments";
import { useTikTokLiveSession } from "./use-tik-tok-live-session";
import {
  buildLiveStreamEventsUrl,
  stopTikTokLiveApi,
  subscribeTikTokLiveApi,
} from "../service/sse-api";
import EventSource from "react-native-sse";
import { useAuthStore } from "@stores/auth";

function createClientId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

type UseTikTokLiveSocketOptions = {
  initialUsername?: string | null;
};

function getPayloadUsername(payload: Record<string, any>) {
  return (
    payload.username ||
    payload.liveUsername ||
    payload.tiktokUsername ||
    payload.tiktok_username ||
    ""
  );
}

export function useTikTokLiveSocket(options: UseTikTokLiveSocketOptions = {}) {
  // Lấy thông tin user & token trực tiếp từ Auth Store
  const authUser = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const loggedInTiktokUsername = authUser?.tiktokUsername || "";
  const eventSourceRef = useRef<EventSource | null>(null);
  const clientIdRef = useRef(createClientId());
  const isManualCloseRef = useRef(false);
  // Mặc định ban đầu dùng username của user đăng nhập
  const initialUsername =
    options.initialUsername || loggedInTiktokUsername || TIKTOK_USERNAME;
  const tiktokUsernameRef = useRef(normalizeTikTokUsername(initialUsername));
  const [status, setStatus] = useState("Đang kết nối Backend SSE...");
  const [isConnected, setIsConnected] = useState(false);
  const [tiktokUsername, setTiktokUsername] = useState(initialUsername);

  const {
    comments,
    setComments,
    addCommentToList,
    updateCommentInList,
    replaceSnapshot,
    clearComments,
  } = useTikTokComments();

  const {
    currentLiveSession,
    currentLiveSessionId,
    liveHistory,
    liveDurationSeconds,
    liveNowText,
    clearLiveHistory,
    reloadLiveHistory,
    finalizeCurrentSessionLocally,
    startSessionFromPayload,
    endSessionFromPayload,
    updateSessionStatusFromPayload,
    addCommentToCurrentSession,
  } = useTikTokLiveSession();

  const handleServerEvent = useCallback(
    (type: string, payload: Record<string, any>) => {
      if (type === "CONNECTED") {
        setStatus("Đã kết nối Backend SSE");
        setIsConnected(true);
        return;
      }

      if (type === "PING") {
        setIsConnected(true);
        return;
      }

      // Giữ lại để tương thích nếu server cũ vẫn bắn event này.
      if (type === "SUBSCRIBING") {
        setStatus(
          `Đang chuẩn bị lấy comment LIVE: ${getPayloadUsername(payload)}`,
        );
        return;
      }

      if (type === "SUBSCRIBED") {
        const username = getPayloadUsername(payload);

        if (username) {
          tiktokUsernameRef.current = username;
          setTiktokUsername(username);
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
        setStatus(`Bắt đầu phiên nhận comment: ${getPayloadUsername(payload)}`);
        return;
      }

      if (type === "LIVE_TIME_ENDED") {
        endSessionFromPayload(payload);
        setStatus(`Đã lưu phiên LIVE: ${getPayloadUsername(payload)}`);
        return;
      }

      if (type === "LIVE_TIME_STATUS") {
        updateSessionStatusFromPayload(payload);
        return;
      }

      if (type === "UNSUBSCRIBED") {
        finalizeCurrentSessionLocally("unsubscribed");
        setComments([]);
        setStatus(`Đã rời LIVE: ${getPayloadUsername(payload)}`);
        return;
      }

      if (type === "LIVE_CONNECTED") {
        const username = getPayloadUsername(payload);

        if (username) {
          tiktokUsernameRef.current = username;
          setTiktokUsername(username);
        }

        startSessionFromPayload(payload);
        setStatus(`Đã kết nối TikTok Live: ${username}`);
        return;
      }

      if (type === "LIVE_DISCONNECTED") {
        endSessionFromPayload(payload);
        setStatus(`TikTok Live đã ngắt: ${getPayloadUsername(payload)}`);
        return;
      }

      if (type === "LIVE_ERROR") {
        finalizeCurrentSessionLocally("live_error");
        setStatus(
          `TikTok lỗi ${getPayloadUsername(payload)}: ${
            payload.message || "Không rõ lỗi"
          }`,
        );
        return;
      }

      if (type === "SNAPSHOT") {
        const snapshot = payload.comments || [];
        replaceSnapshot(Array.isArray(snapshot) ? snapshot : []);
        return;
      }

      if (type === "COMMENT_UPDATED") {
        const commentId = String(payload.commentId || payload.comment_id || "");
        const patch = payload.patch || {};

        if (!commentId) return;

        const updatedComment = updateCommentInList(commentId, patch);

        if (updatedComment) {
          addCommentToCurrentSession(updatedComment);
        }

        return;
      }

      if (type === "COMMENT" || type === "COMMENT_SAVED") {
        // Backend mới bắn payload dạng { liveSessionId, comment }.
        // unwrapSseCommentPayload sẽ lấy phần payload.comment để UI không bị "[object Object]".
        startSessionFromPayload(payload);
        const comment = addCommentToList(unwrapSseCommentPayload(payload));

        if (comment) {
          addCommentToCurrentSession(comment);
        }
      }
    },
    [
      addCommentToCurrentSession,
      addCommentToList,
      updateCommentInList,
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
        const payload = JSON.parse(event?.data ?? "{}");
        handleServerEvent(type, payload);
      } catch (error) {
        if (__DEV__) {
          console.error("SSE parse error:", error);
        }
      }
    },
    [handleServerEvent],
  );

  const connectSse = useCallback(() => {
    const clientId = clientIdRef.current;
    const url = buildLiveStreamEventsUrl(clientId);

    if (!url) {
      setStatus("Thiếu Backend SSE URL");
      return;
    }

    isManualCloseRef.current = false;
    eventSourceRef.current?.close();

    const eventSource = new EventSource(url, {
      headers: {
        Accept: "text/event-stream",
      },
    });

    eventSourceRef.current = eventSource;

    const eventTypes = [
      "CONNECTED",
      "PING",
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
      "COMMENT_SAVED",
      "COMMENT_UPDATED",
    ] as const;

    type CustomEventType = (typeof eventTypes)[number];

    eventTypes.forEach((eventType: CustomEventType) => {
      eventSource.addEventListener(eventType as any, (event: any) => {
        handleEventSourceMessage(eventType, event);
      });
    });

    eventSource.addEventListener("open", () => {
      setIsConnected(true);
      setStatus("Đã kết nối Backend SSE");
    });

    eventSource.addEventListener("error", (error: any) => {
      if (isManualCloseRef.current) return;
      setIsConnected(false);
      setStatus("SSE Backend mất kết nối, đang thử kết nối lại...");

      if (__DEV__) {
        console.error("[SSE Connection Error]:", {
          message: error?.message,
          statusCode: error?.xhrStatus,
          type: error?.type,
        });
      }
    });
  }, [handleEventSourceMessage]);

  // Tự động cập nhật username mặc định khi thông tin user thay đổi
  useEffect(() => {
    if (loggedInTiktokUsername) {
      tiktokUsernameRef.current = normalizeTikTokUsername(
        loggedInTiktokUsername,
      );
      setTiktokUsername(loggedInTiktokUsername);
    }
  }, [loggedInTiktokUsername]);

  const subscribeTikTokUsername = useCallback(
    async (username: string) => {
      const nextUsername = normalizeTikTokUsername(username);

      if (!nextUsername) {
        setStatus("Vui lòng nhập TikTok username");
        return false;
      }

      const oldUsername = tiktokUsernameRef.current;

      if (oldUsername && oldUsername !== nextUsername) {
        finalizeCurrentSessionLocally("change_username");
      }

      tiktokUsernameRef.current = nextUsername;
      setTiktokUsername(nextUsername);
      setComments([]);
      setStatus(
        `Đang yêu cầu Backend start Python collector: ${nextUsername}...`,
      );

      try {
        await subscribeTikTokLiveApi({
          clientId: clientIdRef.current,
          username: nextUsername,
        });

        setStatus(
          `Đã gửi lệnh start collector cho ${nextUsername}, đang chờ comment...`,
        );
        return true;
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("START LIVE STREAM ERROR:", error);
        }

        setStatus(
          error instanceof Error
            ? error.message
            : "Không gọi được API start collector ở Backend",
        );
        return false;
      }
    },
    [finalizeCurrentSessionLocally, setComments],
  );

  const stopLiveSession = useCallback(async () => {
    setStatus("Đang dừng nhận comment...");

    try {
      await stopTikTokLiveApi({
        clientId: clientIdRef.current,
        username: tiktokUsernameRef.current,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("STOP LIVE STREAM ERROR:", error);
      }
    }

    finalizeCurrentSessionLocally("manual_stop");

    return true;
  }, [finalizeCurrentSessionLocally]);

  const reconnect = useCallback(() => {
    finalizeCurrentSessionLocally("manual_reconnect");

    isManualCloseRef.current = false;

    eventSourceRef.current?.close();
    eventSourceRef.current = null;

    connectSse();
  }, [connectSse, finalizeCurrentSessionLocally]);

  const disconnect = useCallback(async () => {
    finalizeCurrentSessionLocally("manual_disconnect");

    isManualCloseRef.current = true;

    try {
      await stopTikTokLiveApi({
        clientId: clientIdRef.current,
        username: tiktokUsernameRef.current,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("DISCONNECT LIVE STREAM ERROR:", error);
      }
    }

    eventSourceRef.current?.close();
    eventSourceRef.current = null;

    setIsConnected(false);
    setStatus("Đã ngắt kết nối");
  }, [finalizeCurrentSessionLocally]);

  useEffect(() => {
    const timer = setTimeout(() => {
      connectSse();
    }, 0);

    return () => {
      clearTimeout(timer);
      isManualCloseRef.current = true;
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [connectSse, accessToken]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextUsername = normalizeTikTokUsername(
        options.initialUsername || "",
      );

      if (!nextUsername) return;

      tiktokUsernameRef.current = nextUsername;
      setTiktokUsername(nextUsername);
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [options.initialUsername]);

  return {
    status,
    isConnected,
    comments,
    tiktokUsername,

    currentLiveSession,
    currentLiveSessionId,
    liveHistory,
    liveDurationSeconds,
    liveNowText,

    setComments,
    clearComments,
    clearLiveHistory,
    reloadLiveHistory,

    reconnect,
    disconnect,
    stopLiveSession,

    changeTikTokUsername: subscribeTikTokUsername,
    subscribeTikTokUsername,
  };
}
