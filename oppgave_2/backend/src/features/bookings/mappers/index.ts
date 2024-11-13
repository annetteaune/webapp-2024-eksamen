import { type Booking } from "../repository";

export const toBookingResponse = (booking: Booking) => ({
  id: booking.id,
  eventId: booking.event_id,
  name: booking.name,
  email: booking.email,
  hasPaid: booking.has_paid,
  status: booking.status,
});

export const toBookingsResponse = (bookings: Booking[]) => ({
  bookings: bookings.map(toBookingResponse),
});
