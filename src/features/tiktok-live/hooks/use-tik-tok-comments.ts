import { LiveComment } from "@app-types/index";
import { MAX_COMMENTS } from "@constants/config";
import { normalizeComment } from "@features/tiktok-live/utils/comment";
import { useCallback, useRef, useState } from "react";

function getCommentText(comment: LiveComment) {
  return String(comment.comment || "").trim();
}

function removeVietnameseTone(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function normalizeTextForKey(value: string) {
  return removeVietnameseTone(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUsernameForKey(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/^@/, "")
    .trim();
}

export function createCommentUniqueKey(comment: LiveComment) {
  const raw = comment.raw as Record<string, any> | undefined;

  const tiktokCommentId =
    raw?.tiktok_comment_id ||
    raw?.comment_id ||
    raw?.commentId ||
    raw?.msg_id ||
    raw?.msgId;

  if (tiktokCommentId) {
    return `id:${String(tiktokCommentId)}`;
  }

  const username = normalizeUsernameForKey(
    comment.customerTikTokUsername ||
      comment.uniqueId ||
      comment.username ||
      comment.displayName ||
      raw?.customerTikTokUsername ||
      raw?.customer_tiktok_username ||
      raw?.tiktokUsername ||
      raw?.tiktok_username ||
      raw?.uniqueId ||
      raw?.unique_id ||
      raw?.username ||
      "",
  );

  const text = normalizeTextForKey(getCommentText(comment));

  if (comment.type === "user_joined") {
    return `joined:${username}:${String(comment.createdAt || comment.id || "")}`;
  }

  return `user_text:${username}:${text}`;
}

function mergeStringArray(oldValue?: string[], nextValue?: string[]) {
  return Array.from(new Set([...(oldValue || []), ...(nextValue || [])])).filter(Boolean);
}

function getBestScore(oldComment: LiveComment, nextComment: LiveComment) {
  return Math.max(
    Number(oldComment.finalScore || 0),
    Number(nextComment.finalScore || 0),
  );
}

function mergeComment(
  oldComment: LiveComment,
  nextComment: LiveComment,
): LiveComment {
  const bestScore = getBestScore(oldComment, nextComment);

  return {
    ...oldComment,
    ...nextComment,
    id: oldComment.id || nextComment.id,
    finalScore: bestScore,
    priorityLevel:
      Number(nextComment.finalScore || 0) >= Number(oldComment.finalScore || 0)
        ? nextComment.priorityLevel || oldComment.priorityLevel
        : oldComment.priorityLevel || nextComment.priorityLevel,
    intent:
      Number(nextComment.finalScore || 0) >= Number(oldComment.finalScore || 0)
        ? nextComment.intent || oldComment.intent
        : oldComment.intent || nextComment.intent,
    aiStatus:
      nextComment.aiStatus === "done" || oldComment.aiStatus === "done"
        ? "done"
        : nextComment.aiStatus || oldComment.aiStatus,
    aiReason: nextComment.aiReason || oldComment.aiReason,
    matchedReasons: mergeStringArray(
      oldComment.matchedReasons,
      nextComment.matchedReasons,
    ),
    missingInfo: mergeStringArray(oldComment.missingInfo, nextComment.missingInfo),
    isOrderCreated: Boolean(oldComment.isOrderCreated || nextComment.isOrderCreated),
    orderId: oldComment.orderId || nextComment.orderId,
  };
}

function sortAndLimitComments(map: Map<string, LiveComment>) {
  const comments = Array.from(map.values());
  const latestJoined = comments.reduce<LiveComment | undefined>((latest, comment) => {
    if (comment.type !== "user_joined") return latest;
    if (!latest) return comment;
    return new Date(comment.createdAt || 0).getTime() >
      new Date(latest.createdAt || 0).getTime()
      ? comment
      : latest;
  }, undefined);
  const sortedComments = comments
    .filter((comment) => comment.type !== "user_joined")
    .sort((a, b) => {
      const bTime = new Date(b.createdAt || 0).getTime();
      const aTime = new Date(a.createdAt || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, latestJoined ? MAX_COMMENTS - 1 : MAX_COMMENTS);

  return latestJoined ? [latestJoined, ...sortedComments] : sortedComments;
}

export function useTikTokComments() {
  const [comments, setComments] = useState<LiveComment[]>([]);
  const commentMapRef = useRef<Map<string, LiveComment>>(new Map());

  const commitComments = useCallback((nextComments: LiveComment[]) => {
    const nextMap = new Map<string, LiveComment>();
    nextComments.forEach((item) => {
      nextMap.set(createCommentUniqueKey(item), item);
    });
    commentMapRef.current = nextMap;
    setComments(nextComments);
  }, []);

  const upsertComments = useCallback(
    (incoming: LiveComment[]) => {
      if (incoming.length === 0) return [] as LiveComment[];

      const map = commentMapRef.current;
      incoming.forEach((incomingComment) => {
        const key = createCommentUniqueKey(incomingComment);
        const existing = map.get(key);
        map.set(key, existing ? mergeComment(existing, incomingComment) : incomingComment);
      });

      const nextComments = sortAndLimitComments(map);
      commitComments(nextComments);
      return incoming;
    },
    [commitComments],
  );

  const addCommentToList = useCallback(
    (rawComment: any) => {
      if (rawComment?.type === "user_joined") {
        const item = rawComment as LiveComment;
        const map = commentMapRef.current;
        map.set(createCommentUniqueKey(item), item);
        const nextComments = sortAndLimitComments(map);
        commitComments(nextComments);
        return item;
      }

      const comment = normalizeComment(rawComment);
      if (!comment) return null;
      return upsertComments([comment])[0] ?? null;
    },
    [commitComments, upsertComments],
  );

  const addCommentsToList = useCallback(
    (rawComments: any[]) => {
      const normalized = rawComments
        .map(normalizeComment)
        .filter((c): c is LiveComment => Boolean(c));

      if (normalized.length === 0) return [];

      upsertComments(normalized);
      return normalized;
    },
    [upsertComments],
  );

  const replaceSnapshot = useCallback(
    (rawComments: any[]) => {
      const normalized = rawComments
        .map(normalizeComment)
        .filter((item): item is LiveComment => Boolean(item));

      const nextComments = sortAndLimitComments(
        normalized.reduce((map, item) => {
          const key = createCommentUniqueKey(item);
          const existing = map.get(key);
          map.set(key, existing ? mergeComment(existing, item) : item);
          return map;
        }, new Map<string, LiveComment>()),
      );

      commitComments(nextComments);
    },
    [commitComments],
  );

  const updateCommentInList = useCallback(
    (commentId: string, patch: Record<string, any>) => {
      let updatedComment: LiveComment | null = null;

      const nextComments = commentMapRef.current.size
        ? Array.from(commentMapRef.current.values()).map((item) => {
            if (item.id !== commentId) return item;

            const nextComment = normalizeComment({
              ...item,
              ...patch,
            });

            updatedComment = nextComment || item;
            return updatedComment;
          })
        : [];

      commitComments(nextComments);
      return updatedComment;
    },
    [commitComments],
  );

  const clearComments = useCallback(() => {
    commentMapRef.current = new Map();
    setComments([]);
  }, []);

  return {
    comments,
    setComments,
    addCommentToList,
    addCommentsToList,
    updateCommentInList,
    replaceSnapshot,
    clearComments,
  };
}
