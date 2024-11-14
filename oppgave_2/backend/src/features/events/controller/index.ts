import { Hono } from "hono";
import db from "../../../db/db";
import {
  getEvents,
  getEvent,
  getEventBySlug,
  addEvent,
  modifyEvent,
  removeEvent,
} from "../service";
import { createEventSchema, updateEventSchema } from "../helpers";

const app = new Hono();

app.get("/", async (c) => {
  const { type, month, year } = c.req.query();

  const filters = {
    typeId: type,
    month: month,
    year: year,
  };

  const result = await getEvents(db, filters);

  if (!result.success) {
    return c.json({ error: result.error }, { status: 500 });
  }

  return c.json(result.data);
});

app.get("/:eventId", async (c) => {
  const eventId = c.req.param("eventId");
  const result = await getEvent(db, eventId);

  if (!result.success) {
    return c.json(
      { error: result.error },
      { status: result.error.code === "EVENT_NOT_FOUND" ? 404 : 500 }
    );
  }

  return c.json(result.data);
});

app.get("/slug/:slug", async (c) => {
  const slug = c.req.param("slug");
  const result = await getEventBySlug(db, slug);

  if (!result.success) {
    return c.json(
      { error: result.error },
      { status: result.error.code === "EVENT_NOT_FOUND" ? 404 : 500 }
    );
  }

  return c.json(result.data);
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createEventSchema.parse(body);

    const result = await addEvent(db, validatedData);

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

app.patch("/:eventId", async (c) => {
  try {
    const eventId = c.req.param("eventId");
    const body = await c.req.json();
    const validatedData = updateEventSchema.parse(body);

    const result = await modifyEvent(db, eventId, validatedData);

    if (!result.success) {
      return c.json(
        { error: result.error },
        { status: result.error.code === "EVENT_NOT_FOUND" ? 404 : 400 }
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

app.delete("/:eventId", async (c) => {
  const eventId = c.req.param("eventId");
  const result = await removeEvent(db, eventId);

  if (!result.success) {
    const status =
      result.error.code === "EVENT_NOT_FOUND"
        ? 404
        : result.error.code === "EVENT_HAS_BOOKINGS"
        ? 400
        : 500;

    return c.json({ error: result.error }, { status });
  }

  return c.json(null, { status: 204 });
});

export default app;
