import { z } from "zod";

// claude.ai
const createLessonTextSchema = z.object({
  text: z.string().min(1),
});
// claude.ai
const createLessonSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  preAmble: z.string().min(1),
  text: z.array(createLessonTextSchema),
});

export const courseSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  // claude.ai
  lessons: z.array(createLessonSchema).optional(),
});
