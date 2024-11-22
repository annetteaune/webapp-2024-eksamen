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

app.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  try {
    const event = (await db
      .prepare("SELECT id FROM events WHERE slug = ?")
      .get(slug)) as { id: string } | undefined;

    if (!event) {
      return c.json({ error: "Event not found" }, { status: 404 });
    }

    const result = await getBookingsByEvent(db, event.id);

    if (!result.success) {
      return c.json(
        {
          error: result.error,
        },
        { status: 500 }
      );
    }

    return c.json(result.data);
  } catch (error) {
    return c.json(
      {
        error: "Failed to fetch bookings",
      },
      { status: 500 }
    );
  }
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
  try {
    const bookingId = c.req.param("bookingId");
    if (!bookingId) {
      return c.json(
        {
          error: {
            code: "INVALID_ID",
            message: "Invalid booking ID",
          },
        },
        { status: 400 }
      );
    }
    const result = await removeBooking(db, bookingId);
    if (!result.success) {
      const statusCode =
        result.error.code === "BOOKING_NOT_FOUND"
          ? 404
          : result.error.code === "INVALID_ID"
          ? 400
          : 500;
      return c.json({ error: result.error }, { status: statusCode });
    }
    return c.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in delete booking endpoint:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while deleting the booking",
        },
      },
      { status: 500 }
    );
  }
});

export default app;
