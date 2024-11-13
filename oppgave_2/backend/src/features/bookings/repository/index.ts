import { type DB } from "../../../db/db";
import { type Result } from "../../../types";
import { generateUUID } from "../../../lib/uuid";
import {
  bookingSchema,
  type createBookingSchema,
  type updateBookingSchema,
} from "../helpers";
import { z } from "zod";

export type Booking = z.infer<typeof bookingSchema>;
export type CreateBooking = z.infer<typeof createBookingSchema>;
export type UpdateBooking = z.infer<typeof updateBookingSchema>;

type DbBooking = {
  id: string;
  event_id: string;
  name: string;
  email: string;
  has_paid: number;
  status: string;
};

export const findAllBookings = async (db: DB): Promise<Result<Booking[]>> => {
  try {
    const bookings = db.prepare("SELECT * FROM bookings").all() as DbBooking[];
    const validatedBookings = bookings.map((booking) =>
      bookingSchema.parse({
        ...booking,
        has_paid: Boolean(booking.has_paid),
      })
    );

    return {
      success: true,
      data: validatedBookings,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "BOOKINGS_NOT_FOUND",
        message: "Could not fetch bookings",
      },
    };
  }
};

export const findBookingsByEventId = async (
  db: DB,
  eventId: string
): Promise<Result<Booking[]>> => {
  try {
    const bookings = db
      .prepare("SELECT * FROM bookings WHERE event_id = ?")
      .all(eventId);

    const validatedBookings = bookings.map((booking) =>
      bookingSchema.parse(booking)
    );

    return {
      success: true,
      data: validatedBookings,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "BOOKINGS_NOT_FOUND",
        message: `Could not fetch bookings for event ${eventId}`,
      },
    };
  }
};

export const createBooking = async (
  db: DB,
  booking: CreateBooking
): Promise<Result<Booking>> => {
  try {
    const id = generateUUID();
    const newBooking = {
      id,
      ...booking,
      has_paid: false,
      status: "Til behandling" as const,
    };

    db.prepare(
      `
      INSERT INTO bookings (id, event_id, name, email, has_paid, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    ).run(
      newBooking.id,
      newBooking.event_id,
      newBooking.name,
      newBooking.email,
      newBooking.has_paid ? 1 : 0,
      newBooking.status
    );

    return {
      success: true,
      data: newBooking,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "BOOKING_CREATE_FAILED",
        message: "Could not create booking",
      },
    };
  }
};

export const updateBooking = async (
  db: DB,
  bookingId: string,
  update: UpdateBooking
): Promise<Result<Booking>> => {
  try {
    const existingBooking = db
      .prepare("SELECT * FROM bookings WHERE id = ?")
      .get(bookingId);

    if (!existingBooking) {
      return {
        success: false,
        error: {
          code: "BOOKING_NOT_FOUND",
          message: `Booking ${bookingId} not found`,
        },
      };
    }

    const updatedBooking = {
      ...existingBooking,
      ...update,
    };

    db.prepare(
      `
      UPDATE bookings 
      SET status = ?, has_paid = ?
      WHERE id = ?
    `
    ).run(update.status, update.has_paid ? 1 : 0, bookingId);

    return {
      success: true,
      data: bookingSchema.parse(updatedBooking),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "BOOKING_UPDATE_FAILED",
        message: `Could not update booking ${bookingId}`,
      },
    };
  }
};

export const deleteBooking = async (
  db: DB,
  bookingId: string
): Promise<Result<void>> => {
  try {
    const result = db
      .prepare("DELETE FROM bookings WHERE id = ?")
      .run(bookingId);

    if (result.changes === 0) {
      return {
        success: false,
        error: {
          code: "BOOKING_NOT_FOUND",
          message: `Booking ${bookingId} not found`,
        },
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "BOOKING_DELETE_FAILED",
        message: `Could not delete booking ${bookingId}`,
      },
    };
  }
};
