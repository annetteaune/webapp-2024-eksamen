import { type DB } from "@/db/db";
import {
  findAllBookings,
  findBookingsByEventId,
  createBooking,
  updateBooking,
  deleteBooking,
  type CreateBooking,
  type UpdateBooking,
} from "../repository";
import { toBookingResponse, toBookingsResponse } from "../mappers";
import { type Result } from "@/types";

// responstyper
type BookingsResponse = {
  bookings: {
    id: string;
    eventId: string;
    name: string;
    email: string;
    hasPaid: boolean;
    status: "Godkjent" | "På venteliste" | "Avslått";
  }[];
};

type BookingResponse = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  hasPaid: boolean;
  status: "Godkjent" | "På venteliste" | "Avslått";
};

export const getAllBookings = async (
  db: DB
): Promise<Result<BookingsResponse>> => {
  const result = await findAllBookings(db);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: toBookingsResponse(result.data),
  };
};

export const getBookingsByEvent = async (
  db: DB,
  eventId: string
): Promise<Result<BookingsResponse>> => {
  const result = await findBookingsByEventId(db, eventId);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: toBookingsResponse(result.data),
  };
};

export const addBooking = async (
  db: DB,
  booking: CreateBooking
): Promise<Result<BookingResponse>> => {
  const result = await createBooking(db, booking);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: toBookingResponse(result.data),
  };
};

export const modifyBooking = async (
  db: DB,
  bookingId: string,
  update: UpdateBooking
): Promise<Result<BookingResponse>> => {
  const result = await updateBooking(db, bookingId, update);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: toBookingResponse(result.data),
  };
};

export const removeBooking = async (
  db: DB,
  bookingId: string
): Promise<Result<void>> => {
  return await deleteBooking(db, bookingId);
};
