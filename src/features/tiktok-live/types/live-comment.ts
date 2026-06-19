export type {
  AiStatus as AIStatus,
  AiStatus,
  CommentIntent,
  CommentPriorityLevel as PriorityLevel,
  CommentPriorityLevel,
  LiveComment,
} from "@app-types/index";

export type LiveStatus = {
  status: string;
  message: string;
  createdAt?: string;
};
