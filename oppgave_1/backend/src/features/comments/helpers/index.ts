import { z } from "zod";

export const createCommentSchema = z.object({
  comment: z.string().min(1),
  createdById: z.string().min(1),
  createdByName: z.string().min(1),
  lessonSlug: z.string().min(1),
});
