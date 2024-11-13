import { Hono } from "hono";
import db from "../../../db/db";
import {
  getAllBookings,
  getBookingsByEvent,
  addBooking,
  modifyBooking,
  removeBooking,
} from "../service";
import { createBookingSchema, updateBookingSchema } from "../helpers";

const app = new Hono();

app.get("/", async (c) => {
  const result = await getAllBookings(db);

  if (!result.success) {
    return c.json({ error: result.error }, { status: 500 });
  }

  return c.json(result.data);
});

app.get("/:eventId", async (c) => {
  const eventId = c.req.param("eventId");
  const result = await getBookingsByEvent(db, eventId);

  if (!result.success) {
    return c.json({ error: result.error }, { status: 500 });
  }

  return c.json(result.data);
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createBookingSchema.parse(body);

    const result = await addBooking(db, validatedData);

    if (!result.success) {
      return c.json({ error: result.error }, { status: 400 });
    }

    return c.json(result.data, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        },
        { status: 400 }
      );
    }
    return c.json(
      {
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
});

app.patch("/:bookingId", async (c) => {
  try {
    const bookingId = c.req.param("bookingId");
    const body = await c.req.json();
    const validatedData = updateBookingSchema.parse(body);

    const result = await modifyBooking(db, bookingId, validatedData);

    if (!result.success) {
      return c.json(
        { error: result.error },
        { status: result.error.code === "BOOKING_NOT_FOUND" ? 404 : 400 }
      );
    }

    return c.json(result.data);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        },
        { status: 400 }
      );
    }
    return c.json(
      {
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
});

app.delete("/:bookingId", async (c) => {
  const bookingId = c.req.param("bookingId");
  const result = await removeBooking(db, bookingId);

  if (!result.success) {
    return c.json(
      { error: result.error },
      { status: result.error.code === "BOOKING_NOT_FOUND" ? 404 : 500 }
    );
  }

  return c.json(null, { status: 204 });
});

export default app;
