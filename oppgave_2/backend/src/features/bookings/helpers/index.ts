import { z } from "zod";

export const bookingSchema = z.object({
  id: z.string().min(1),
  event_id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  has_paid: z.boolean(),
  status: z.enum(["Godkjent", "Til behandling", "På venteliste", "Avslått"]),
});

export const createBookingSchema = bookingSchema.omit({
  id: true,
  has_paid: true,
  status: true,
});

export const updateBookingSchema = z.object({
  status: z.enum(["Godkjent", "Til behandling", "På venteliste", "Avslått"]),
  has_paid: z.boolean().optional(),
});
