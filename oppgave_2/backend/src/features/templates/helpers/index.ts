import { z } from "zod";

// claude.ai
export const templateSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .min(1, "Navn på mal er påkrevd")
    .max(100, "Navn kan ikke være lengre enn 100 tegn"),
  allowed_days: z.array(z.string()).min(1, "Velg minst én tillatt dag"),
  max_capacity: z
    .number()
    .int("Kapasitet må være et helt tall")
    .positive("Kapasitet må være større enn 0")
    .max(1000, "Kapasitet kan ikke være større enn 1000"),
  price: z
    .number()
    .min(0, "Pris kan ikke være negativ")
    .max(10000, "Pris kan ikke være større enn 10000"),
  is_private: z.boolean(),
  allow_waitlist: z.boolean(),
  allow_same_day: z.boolean(),
  created_at: z.string().datetime(),
  type_id: z.string().min(1, "Type er påkrevd"),
});

export const createTemplateSchema = templateSchema.omit({
  id: true,
  created_at: true,
});

export const updateTemplateSchema = templateSchema.partial().omit({
  id: true,
  created_at: true,
});

export type Template = z.infer<typeof templateSchema>;
export type CreateTemplate = z.infer<typeof createTemplateSchema>;
export type UpdateTemplate = z.infer<typeof updateTemplateSchema>;
