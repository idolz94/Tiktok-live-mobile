import { LiveComment } from "@app-types/index";
import { MAX_COMMENTS } from "@constants/config";
import { normalizeComment } from "@utils/comment";
import isEmpty from "lodash.isempty";
import { useCallback, useState } from "react";

function getCommentText(comment: LiveComment) {
  return String(comment.comment || "").trim();
}

function removeVietnameseTone(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

  return `user_text:${username}:${text}`;
}

function mergeStringArray(oldValue?: string[], nextValue?: string[]) {
  return Array.from(
    new Set([...(oldValue || []), ...(nextValue || [])]),
  ).filter(Boolean);
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

    missingInfo: mergeStringArray(
      oldComment.missingInfo,
      nextComment.missingInfo,
    ),

    isOrderCreated: Boolean(
      oldComment.isOrderCreated || nextComment.isOrderCreated,
    ),

    orderId: oldComment.orderId || nextComment.orderId,
  };
}

function dedupComments(comments: LiveComment[]) {
  const map = new Map<string, LiveComment>();

  comments.forEach((comment) => {
    const key = createCommentUniqueKey(comment);
    const oldComment = map.get(key);

    if (!oldComment) {
      map.set(key, comment);
      return;
    }

    map.set(key, mergeComment(oldComment, comment));
  });

  return Array.from(map.values())
    .sort((a, b) => {
      const bTime = new Date(b.createdAt || 0).getTime();
      const aTime = new Date(a.createdAt || 0).getTime();

      return bTime - aTime;
    })
    .slice(0, MAX_COMMENTS);
}

export function useTikTokComments() {
  const [comments, setComments] = useState<LiveComment[]>([]);

  const addCommentToList = useCallback((rawComment: any) => {
    // user_joined không có comment text nên bypass normalizeComment
    if (rawComment?.type === "user_joined") {
      const item = rawComment as LiveComment;
      setComments((prev) =>
        [item, ...prev.filter((c) => c.type !== "user_joined")].slice(
          0,
          MAX_COMMENTS,
        ),
      );
      return item;
    }

    const comment = normalizeComment(rawComment);

    if (!comment) return null;

    setComments((prev) => {
      return dedupComments([comment, ...prev]);
    });

    return comment;
  }, []);

  // Bulk version: nhận mảng comment, chỉ gọi setComments 1 lần duy nhất
  // Dùng cho batch flush để tránh N renders khi flush N comment cùng lúc
  const addCommentsToList = useCallback((rawComments: any[]) => {
    const normalized = rawComments
      .map(normalizeComment)
      .filter((c): c is LiveComment => Boolean(c));

    if (normalized.length === 0) return [];

    setComments((prev) => dedupComments([...normalized, ...prev]));

    return normalized;
  }, []);

  const replaceSnapshot = useCallback((rawComments: any[]) => {
    const normalized = rawComments
      .map(normalizeComment)
      .filter((item): item is LiveComment => Boolean(item));

    setComments(dedupComments(normalized));
  }, []);

  const updateCommentInList = useCallback(
    (commentId: string, patch: Record<string, any>) => {
      let updatedComment: LiveComment | null = null;

      setComments((prev) =>
        dedupComments(
          prev.map((item) => {
            if (item.id !== commentId) return item;

            const nextComment = normalizeComment({
              ...item,
              ...patch,
            });

            updatedComment = nextComment || item;

            return updatedComment;
          }),
        ),
      );

      return updatedComment;
    },
    [],
  );

  const clearComments = useCallback(() => {
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
