import { z } from "zod";

export const lessonSchema = z.object({
  course_id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  pre_amble: z.string().min(1),
  order_number: z.number().int().min(0),
});
