import { z } from "zod";

export interface Booking {
  id: string;
  eventId: string;
  name: string;
  email: string;
  hasPaid: boolean;
  status: "Godkjent" | "Til behandling" | "På venteliste" | "Avslått";
}

export interface BookingsResponse {
  bookings: Booking[];
}

export interface CreateBookingData {
  event_id: string;
  name: string;
  email: string;
}

export interface BookingStatus {
  canBook: boolean;
  availableSpots: number;
  mustUseWaitlist: boolean;
  message: string;
  totalPrice: number;
}

export const bookingDataSchema = z.object({
  name: z
    .string()
    .min(2, "Navn må være minst 2 tegn")
    .regex(/^[a-zA-ZæøåÆØÅ\s-]+$/, "Navn kan kun inneholde bokstaver"),
  email: z.string().email("Ugyldig e-postadresse"),
  event_id: z.string().uuid("Ugyldig arrangement-ID"),
});

export type Attendee = {
  name: string;
  email: string;
};

export interface UseBookingFormProps {
  event: Event;
  eventSlug: string;
  eventTitle: string;
}
