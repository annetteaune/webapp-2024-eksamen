import { z } from "zod";

export const templateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  allowed_days: z.array(z.string()),
  max_capacity: z.number().positive(),
  price: z.number().min(0),
  is_private: z.boolean(),
  allow_waitlist: z.boolean(),
  allow_same_day: z.boolean(),
  created_at: z.string(),
});

export const createTemplateSchema = templateSchema.omit({
  id: true,
  created_at: true,
});

export const updateTemplateSchema = templateSchema.partial().omit({
  id: true,
  created_at: true,
});
