import { z } from "zod";

const waitlistItemSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  status: z.literal("På venteliste"),
  added_at: z.string(),
});

export const eventSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description_short: z.string().min(1),
  description_long: z.string().min(1),
  date: z.string(),
  location: z.string().min(1),
  type_id: z.string().min(1),
  type_name: z.string().min(1),
  capacity: z.number().positive(),
  price: z.number().min(0),
  template_id: z.string().min(1).nullable().optional(),
  status: z.enum(["Ledige plasser", "Fullbooket"]),
  is_private: z.boolean(),
  allow_same_day: z.boolean(),
  allow_waitlist: z.boolean().optional(),
  waitlist: z.array(waitlistItemSchema).nullable(),
});

export const createEventSchema = eventSchema
  .omit({
    id: true,
    status: true,
    waitlist: true,
    type_name: true,
  })
  .extend({
    template_id: z.string().min(1).optional(),
    allow_waitlist: z.boolean().optional(),
  });

export const updateEventSchema = z
  .object({
    slug: z.string().min(1),
    title: z.string().min(1),
    description_short: z.string().min(1),
    description_long: z.string().min(1),
    date: z.string(),
    location: z.string().min(1),
    type_id: z.string().min(1),
    capacity: z.number().int().positive(),
    price: z.number().min(0),
    template_id: z.string().nullable(),
    status: z.enum(["Ledige plasser", "Fullbooket"]),
    is_private: z.boolean(),
    allow_same_day: z.boolean(),
    allow_waitlist: z.boolean(),
  })
  .partial();

export type Event = z.infer<typeof eventSchema>;
export type CreateEvent = z.infer<typeof createEventSchema>;
export type UpdateEvent = z.infer<typeof updateEventSchema>;

export type DbEvent = {
  id: string;
  slug: string;
  title: string;
  description_short: string;
  description_long: string;
  date: string;
  location: string;
  type_id: string;
  type_name: string;
  capacity: number;
  price: number;
  template_id: string | null;
  status: string;
  is_private: number;
  allow_same_day: number;
  waitlist: string | null;
  allow_waitlist: string;
};
