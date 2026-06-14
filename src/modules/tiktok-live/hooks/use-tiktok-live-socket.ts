import {
  TIKTOK_USERNAME,
  WEB_URL_ORIGIN,
  MOBILE_APP_KEY,
} from "@constants/config";
import {
  normalizeTikTokUsername,
  unwrapSseCommentPayload,
} from "@utils/comment";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useTikTokComments } from "./use-tik-tok-comments";
import { useTikTokLiveSession } from "./use-tik-tok-live-session";
import {
  buildLiveStreamEventsUrl,
  stopTikTokLiveApi,
  subscribeTikTokLiveApi,
} from "../service/sse-api";
import { useAuthStore } from "@stores/auth";
import { getAuthToken } from "@utils/http/request-sse";
import { UserJoinedEvent } from "../types";
import { loadString, saveString, STORAGE_KEYS } from "@utils/storage";
import { fetchSse } from "@utils/http/fetch-sse";

// export function createClientId() {
//   if (typeof crypto !== "undefined" && crypto.randomUUID) {
//     return crypto.randomUUID();
//   }

//   return `${Date.now()}-${Math.random()}`;
// }

export function createClientId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;

    return value.toString(16);
  });
}

export function getOrCreateClientId() {
  const existing = loadString(STORAGE_KEYS.CLIENT_ID);

  if (existing) return existing;

  const clientId = createClientId();
  saveString(STORAGE_KEYS.CLIENT_ID, clientId);

  return clientId;
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

  const loggedInTiktokUsername = authUser?.tiktokUsername || "";
  const abortControllerRef = useRef<AbortController | null>(null);
  const clientIdRef = useRef(getOrCreateClientId());
  const isManualCloseRef = useRef(false);
  const isAuthFailedRef = useRef(false);

  // Batch: gom comment vào queue, flush vào state mỗi 200ms
  const pendingCommentsRef = useRef<any[]>([]);
  const batchFlushTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Retry với exponential backoff khi SSE mất kết nối
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000];

  // Mặc định ban đầu dùng username của user đăng nhập.
  // Nếu user đã login nhưng tiktokUsername chưa load xong (bootstrap đang chạy),
  // dùng chuỗi rỗng và để useEffect cập nhật sau.
  // Chỉ dùng TIKTOK_USERNAME hardcoded khi chưa có user nào đăng nhập (dev/test).
  const initialUsername =
    options.initialUsername ||
    loggedInTiktokUsername ||
    (authUser ? "" : TIKTOK_USERNAME);
  const tiktokUsernameRef = useRef(
    normalizeTikTokUsername(initialUsername || TIKTOK_USERNAME),
  );
  const joinEventTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState("Đang kết nối Backend SSE...");
  const [isConnected, setIsConnected] = useState(false);
  const [tiktokUsername, setTiktokUsername] = useState(
    initialUsername || TIKTOK_USERNAME,
  );
  const [joinEvent, setJoinEvent] = useState<UserJoinedEvent | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [fatalEvent, setFatalEvent] = useState<{
    type: string;
    message: string;
  } | null>(null);

  const {
    comments,
    setComments,
    addCommentToList,
    addCommentsToList,
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
        const disconnectMsg =
          payload.message ||
          `TikTok Live đã ngắt kết nối: ${getPayloadUsername(payload)}`;
        setStatus(disconnectMsg);
        setFatalEvent({ type, message: disconnectMsg });
        return;
      }

      if (type === "LIVE_ERROR") {
        const message = payload.message || "Không rõ lỗi";
        const errorText = `TikTok lỗi ${getPayloadUsername(payload)}: ${message}`;

        if (__DEV__)
          console.log(
            "[handleServerEvent] LIVE_ERROR full payload:",
            JSON.stringify(payload),
          );

        finalizeCurrentSessionLocally("live_error");
        setIsConnected(false);
        setComments([]);
        if (joinEventTimerRef.current) {
          clearTimeout(joinEventTimerRef.current);
          joinEventTimerRef.current = null;
        }
        setJoinEvent(null);
        setLiveError(errorText);
        setStatus(errorText);
        setFatalEvent({ type, message: errorText });
        return;
      }

      if (type === "COLLECTOR_STOPPED") {
        if (__DEV__)
          console.log(
            "[handleServerEvent] COLLECTOR_STOPPED full payload:",
            JSON.stringify(payload),
          );
        const message = payload.message || "Collector đã dừng";
        finalizeCurrentSessionLocally("collector_stopped");
        setIsConnected(false);
        setStatus(message);
        setFatalEvent({ type, message });
        return;
      }

      if (type === "USER_JOINED") {
        const displayName =
          payload.joinDisplayName ||
          payload.nickname ||
          payload.joinUsername ||
          "Người xem";
        const joinAvatarUrl =
          payload.joinAvatarUrl ||
          payload.avatarUrl ||
          payload.avatar ||
          payload.comment?.avatarUrl ||
          payload.comment?.avatar;

        if (joinEventTimerRef.current) {
          clearTimeout(joinEventTimerRef.current);
        }

        setJoinEvent({
          shopId: payload.shopId,
          liveUsername: payload.liveUsername,
          nickname: payload.nickname,
          joinUsername: payload.joinUsername,
          joinDisplayName: payload.joinDisplayName,
          joinAvatarUrl,
          createdAt: payload.createdAt,
          displayName,
        });

        joinEventTimerRef.current = setTimeout(() => {
          setJoinEvent(null);
          joinEventTimerRef.current = null;
        }, 3000);

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
        startSessionFromPayload(payload);
        // Đưa vào queue, batch flush interval sẽ gọi addCommentToList + addCommentToCurrentSession
        // sau 200ms — tránh setComments chạy 50+ lần/s khi live đông người
        pendingCommentsRef.current.push(unwrapSseCommentPayload(payload));
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

  const connectSse = useCallback(async () => {
    const clientId = clientIdRef.current;
    const url = buildLiveStreamEventsUrl(clientId);
    const accessToken = await getAuthToken();

    if (__DEV__) {
      console.log(
        `[connectSse] url=${url} hasToken=${!!accessToken} isAuthFailed=${isAuthFailedRef.current}`,
      );
    }

    if (isAuthFailedRef.current) {
      setStatus("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
      return;
    }

    if (!accessToken) {
      console.warn("[SSE] Missing access token");
      return;
    }

    if (!url) {
      setStatus("Thiếu Backend SSE URL");
      return;
    }

    // Cancel retry timer cũ để tránh double connect
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    isManualCloseRef.current = false;
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    fetchSse(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Origin: WEB_URL_ORIGIN,
        "x-app-key": MOBILE_APP_KEY,
      },
      signal: abortControllerRef.current.signal,
      onOpen: () => {
        retryCountRef.current = 0;
        if (__DEV__)
          console.log("[connectSse] SSE onOpen — connection established");
        setIsConnected(true);
        setStatus("Đã kết nối Backend SSE");
      },
      onEvent: (type, data) => {
        if (__DEV__) console.log(`[connectSse] SSE event type=${type}`, data);
        try {
          const payload = JSON.parse(data || "{}");
          handleServerEvent(type, payload);
        } catch (err) {
          if (__DEV__) console.error("[SSE parse error]:", err);
        }
      },
      onError: (error) => {
        if (isManualCloseRef.current) return;
        setIsConnected(false);

        const attempt = retryCountRef.current;
        const delay = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];

        retryCountRef.current += 1;
        setStatus(
          `SSE mất kết nối, thử lại sau ${delay / 1000}s (lần ${attempt + 1})...`,
        );
        if (__DEV__) console.error("[SSE Connection Error]:", error);

        retryTimerRef.current = setTimeout(() => {
          if (!isManualCloseRef.current) connectSse();
        }, delay);
      },
    });
  }, [handleServerEvent]);

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
      const oldUsernameWithoutAt = oldUsername.replace(/^@/, "");

      if (oldUsername && oldUsername !== nextUsername) {
        finalizeCurrentSessionLocally("change_username");
        // Clear retry timer cũ để tránh reconnect vào stream của username cũ
        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current);
          retryTimerRef.current = null;
        }
        retryCountRef.current = 0;
        try {
          await stopTikTokLiveApi({
            clientId: clientIdRef.current,
            username: oldUsernameWithoutAt,
          });
        } catch {
          // best-effort: bỏ qua lỗi khi dừng collector cũ
        }
      }

      tiktokUsernameRef.current = nextUsername;
      setTiktokUsername(nextUsername);
      setLiveError(null);
      setComments([]);
      setStatus(
        `Đang yêu cầu Backend start Python collector: ${nextUsername}...`,
      );

      if (__DEV__) {
        console.log(
          `[useTikTokLiveSocket] subscribeTikTokUsername: calling API for "${nextUsername}" (clientId: ${clientIdRef.current})`,
        );
      }

      try {
        const result = await subscribeTikTokLiveApi({
          clientId: clientIdRef.current,
          username: nextUsername.replace(/^@/, ""),
        });

        if (__DEV__) {
          console.log(
            `[useTikTokLiveSocket] subscribeTikTokLiveApi result:`,
            JSON.stringify(result),
          );
        }

        if (result?.username) {
          tiktokUsernameRef.current = result.username;
          setTiktokUsername(result.username);
        }

        connectSse();
        setStatus(
          result?.message ||
            `Đã gửi lệnh start collector cho ${nextUsername}, đang chờ comment...`,
        );
        return result?.success ?? true;
      } catch (error) {
        if (__DEV__) {
          console.error("START LIVE STREAM ERROR:", error);
        }

        const message =
          error instanceof Error
            ? error.message
            : "Không gọi được API start collector ở Backend";
        setLiveError(message);
        setStatus(message);
        return false;
      }
    },
    [finalizeCurrentSessionLocally, setComments, connectSse],
  );

  const clearLiveError = useCallback(() => {
    setLiveError(null);
  }, []);

  const clearFatalEvent = useCallback(() => {
    setFatalEvent(null);
  }, []);

  const stopLiveSession = useCallback(async () => {
    setStatus("Đang dừng nhận comment...");

    if (__DEV__) {
      console.log(
        `[useTikTokLiveSocket] stopLiveSession: calling API for "${tiktokUsernameRef.current}" (clientId: ${clientIdRef.current})`,
      );
    }

    try {
      await stopTikTokLiveApi({
        clientId: clientIdRef.current,
        username: tiktokUsernameRef.current,
      });
    } catch (error) {
      if (__DEV__) {
        console.error("STOP LIVE STREAM ERROR:", error);
      }
    }

    // Đóng SSE connection để dừng nhận comment
    isManualCloseRef.current = true;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    finalizeCurrentSessionLocally("manual_stop");
    setIsConnected(false);
    setStatus("Đã dừng nhận comment");

    return true;
  }, [finalizeCurrentSessionLocally]);

  const reconnect = useCallback(() => {
    finalizeCurrentSessionLocally("manual_reconnect");

    isManualCloseRef.current = false;

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    connectSse();
  }, [connectSse, finalizeCurrentSessionLocally]);

  const disconnect = useCallback(async () => {
    finalizeCurrentSessionLocally("manual_disconnect");

    isManualCloseRef.current = true;

    if (__DEV__) {
      console.log(
        `[useTikTokLiveSocket] disconnect: calling API for "${tiktokUsernameRef.current}" (clientId: ${clientIdRef.current})`,
      );
    }

    try {
      await stopTikTokLiveApi({
        clientId: clientIdRef.current,
        username: tiktokUsernameRef.current,
      });
    } catch (error) {
      if (__DEV__) {
        console.error("DISCONNECT LIVE STREAM ERROR:", error);
      }
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setIsConnected(false);
    setStatus("Đã ngắt kết nối");
  }, [finalizeCurrentSessionLocally]);

  useEffect(() => {
    // Batch flush: mỗi 200ms gom tất cả comment pending vào state 1 lần duy nhất
    batchFlushTimerRef.current = setInterval(() => {
      if (pendingCommentsRef.current.length === 0) return;
      const batch = pendingCommentsRef.current.splice(0);
      const added = addCommentsToList(batch);
      added.forEach((c) => addCommentToCurrentSession(c));
    }, 200);

    // AppState: iOS suspend network khi app vào background
    // delay 500ms khi quay lại foreground để network stack kịp sẵn sàng
    const appStateSub = AppState.addEventListener(
      "change",
      (nextState: string) => {
        if (nextState === "active" && !isManualCloseRef.current) {
          setTimeout(() => {
            if (isManualCloseRef.current) return;
            abortControllerRef.current?.abort();
            abortControllerRef.current = null;
            connectSse();
          }, 500);
        }
      },
    );

    return () => {
      isManualCloseRef.current = true;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      if (batchFlushTimerRef.current) {
        clearInterval(batchFlushTimerRef.current);
        batchFlushTimerRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (joinEventTimerRef.current) {
        clearTimeout(joinEventTimerRef.current);
        joinEventTimerRef.current = null;
      }
      appStateSub.remove();
    };
  }, [connectSse, addCommentsToList, addCommentToCurrentSession]);

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
    joinEvent,
    liveError,

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
    clearLiveError,

    fatalEvent,
    clearFatalEvent,

    changeTikTokUsername: subscribeTikTokUsername,
    subscribeTikTokUsername,
  };
}
