import { z } from "zod";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const mergeDraftsSchema = z
  .object({
    targetOrderId: z.string().regex(UUID_RE, "ID đơn đích không hợp lệ"),
    sourceOrderIds: z
      .array(z.string().regex(UUID_RE, "ID đơn nguồn không hợp lệ"))
      .min(1, "Cần chọn ít nhất 1 đơn nguồn")
      .max(50, "Chỉ có thể gộp tối đa 50 đơn nguồn"),
  })
  .refine((data) => !data.sourceOrderIds.includes(data.targetOrderId), {
    message: "Đơn nguồn không được chứa đơn đích",
    path: ["sourceOrderIds"],
  });

export type MergeDraftsFormValues = z.infer<typeof mergeDraftsSchema>;
