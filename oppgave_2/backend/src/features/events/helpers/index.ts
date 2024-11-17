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
  type_name: z.string(),
  capacity: z.number().positive(),
  price: z.number().min(0),
  template_id: z.string().nullable(),
  status: z.enum(["Ledige plasser", "Fullbooket"]),
  waitlist: z.array(waitlistItemSchema).nullable(),
  allow_waitlist: z.boolean().default(false),
});

export const updateEventSchema = eventSchema.partial().omit({
  id: true,
  waitlist: true,
});

export const createEventSchema = z.object({
  slug: z
    .string()
    .min(1, "URL-slug er påkrevd")
    .regex(
      /^[a-z0-9-]+$/,
      "URL-slug kan kun inneholde små bokstaver, tall og bindestrek"
    ),
  title: z
    .string()
    .min(1, "Tittel er påkrevd")
    .max(100, "Tittel kan ikke være lengre enn 100 tegn"),
  description_short: z
    .string()
    .min(1, "Kort beskrivelse er påkrevd")
    .max(200, "Kort beskrivelse kan ikke være lengre enn 200 tegn"),
  description_long: z
    .string()
    .min(1, "Lang beskrivelse er påkrevd")
    .max(2000, "Lang beskrivelse kan ikke være lengre enn 2000 tegn"),
  date: z.string().refine((date) => {
    try {
      const eventDate = new Date(date);
      const now = new Date();
      return eventDate > now;
    } catch {
      return false;
    }
  }, "Dato må være i fremtiden"),
  location: z.string().min(1, "Lokasjon er påkrevd"),
  type_id: z.string().min(1, "Type er påkrevd"),
  capacity: z.number().positive("Kapasitet må være større enn 0").int(),
  price: z.number().min(0, "Pris kan ikke være negativ"),
  template_id: z.string().optional().nullable(),
  allow_waitlist: z.boolean().default(false),
});

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
  template_id: string;
  status: string;
  allow_waitlist: number;
  waitlist: string | null;
};
export type Event = z.infer<typeof eventSchema>;
export type CreateEvent = z.infer<typeof createEventSchema>;
export type UpdateEvent = z.infer<typeof updateEventSchema>;
