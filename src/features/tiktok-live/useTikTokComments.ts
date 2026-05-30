import { useCallback, useState } from "react";
import { MAX_COMMENTS } from "@/constants/config";
import type { LiveComment } from "@/types";
import { normalizeComment } from "@/utils/comment";

export function useTikTokComments() {
  const [comments, setComments] = useState<LiveComment[]>([]);

  const addCommentToList = useCallback((rawComment: unknown) => {
    const comment = normalizeComment(rawComment);
    if (!comment) return null;

    setComments((prev) => {
      const existed = prev.some((item) => item.id === comment.id);
      if (existed) return prev;
      return [comment, ...prev].slice(0, MAX_COMMENTS);
    });

    return comment;
  }, []);

  const replaceSnapshot = useCallback((rawComments: unknown[]) => {
    const normalized = rawComments
      .map(normalizeComment)
      .filter((item): item is LiveComment => Boolean(item));

    setComments(normalized.slice(0, MAX_COMMENTS));
  }, []);

  const clearComments = useCallback(() => setComments([]), []);

  return { comments, setComments, addCommentToList, replaceSnapshot, clearComments };
}
