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

type EventDetails = {
  price: number;
  capacity: number;
  template_id: string;
  status: string;
  allow_waitlist: string;
};

type DbEvent = {
  id: string;
  capacity: number;
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
      .all(eventId) as DbBooking[];

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
    console.error("Error in findBookingsByEventId:", error);
    return {
      success: false,
      error: {
        code: "BOOKINGS_NOT_FOUND",
        message: `Could not fetch bookings for event ${eventId}`,
      },
    };
  }
};

// claude.ai har skrevet store deler av denne koden
export const createBooking = async (
  db: DB,
  booking: CreateBooking
): Promise<Result<Booking>> => {
  try {
    const id = generateUUID();
    const eventDetails = db
      .prepare(
        `
      SELECT e.*, t.allow_waitlist as template_allow_waitlist 
      FROM events e 
      LEFT JOIN templates t ON e.template_id = t.id 
      WHERE e.id = ?
    `
      )
      .get(booking.event_id) as any;

    if (!eventDetails) {
      return {
        success: false,
        error: {
          code: "EVENT_NOT_FOUND",
          message: "Could not find event",
        },
      };
    }

    const currentBookings = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE event_id = ? AND status IN ('Godkjent', 'Til behandling')
    `
      )
      .get(booking.event_id) as { count: number };

    const hasCapacity = currentBookings.count < eventDetails.capacity;

    const allowWaitlist = eventDetails.template_id
      ? Boolean(eventDetails.template_allow_waitlist)
      : Boolean(eventDetails.allow_waitlist);

    let status: string;
    if (hasCapacity) {
      status = eventDetails.price === 0 ? "Godkjent" : "Til behandling";
    } else if (allowWaitlist) {
      status = "På venteliste";
    } else {
      return {
        success: false,
        error: {
          code: "EVENT_FULL",
          message: "Event is full and does not allow waitlist",
        },
      };
    }

    const newBooking = {
      id,
      event_id: booking.event_id,
      name: booking.name,
      email: booking.email,
      has_paid: eventDetails.price === 0 && status === "Godkjent" ? 1 : 0,
      status,
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
      newBooking.has_paid,
      newBooking.status
    );
    if (currentBookings.count + 1 >= eventDetails.capacity) {
      db.prepare(`UPDATE events SET status = 'Fullbooket' WHERE id = ?`).run(
        booking.event_id
      );
    }
    return {
      success: true,
      data: {
        ...newBooking,
        has_paid: Boolean(newBooking.has_paid),
      } as Booking,
    };
  } catch (error) {
    console.error("Booking creation error:", error);
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

// claude.ai har skrevet store deler av denne koden
export const deleteBooking = async (
  db: DB,
  bookingId: string
): Promise<Result<void>> => {
  let transaction = false;

  try {
    const booking = db
      .prepare("SELECT * FROM bookings WHERE id = ?")
      .get(bookingId) as DbBooking | undefined;

    if (!booking) {
      return {
        success: false,
        error: {
          code: "BOOKING_NOT_FOUND",
          message: `Booking ${bookingId} not found`,
        },
      };
    }

    const event = db
      .prepare("SELECT * FROM events WHERE id = ?")
      .get(booking.event_id) as DbEvent;

    db.prepare("BEGIN").run();
    transaction = true;

    const deleteResult = db
      .prepare("DELETE FROM bookings WHERE id = ?")
      .run(bookingId);

    if (deleteResult.changes === 0) {
      throw new Error("No booking was deleted");
    }

    const remainingBookings = db
      .prepare(
        "SELECT COUNT(*) as count FROM bookings WHERE event_id = ? AND status = 'Godkjent'"
      )
      .get(booking.event_id) as { count: number };

    if (
      event.status === "Fullbooket" &&
      remainingBookings.count < event.capacity
    ) {
      db.prepare(
        "UPDATE events SET status = 'Ledige plasser' WHERE id = ?"
      ).run(booking.event_id);
    }

    db.prepare("COMMIT").run();
    transaction = false;

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Error in deleteBooking:", error);

    if (transaction) {
      try {
        db.prepare("ROLLBACK").run();
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }

    return {
      success: false,
      error: {
        code: "BOOKING_DELETE_FAILED",
        message:
          error instanceof Error ? error.message : "Could not delete booking",
      },
    };
  }
};
