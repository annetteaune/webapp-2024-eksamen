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
