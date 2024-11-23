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
  const { type, month, year, template, includePrivate } = c.req.query();

  const filters = {
    typeId: type,
    month: month,
    year: year,
    templateId: template,
    includePrivate: includePrivate === "true",
  };

  const result = await getEvents(db, filters);

  if (!result.success) {
    return c.json({ error: result.error }, { status: 500 });
  }
  return c.json(result.data);
});

app.get("/by-id/:eventId", async (c) => {
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

app.get("/:slug", async (c) => {
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

app.patch("/by-id/:eventId", async (c) => {
  try {
    const eventId = c.req.param("eventId");
    const body = await c.req.json();
    console.log("Raw request body:", body);

    const validatedData = updateEventSchema.safeParse(body);
    console.log("Validation result:", validatedData);

    if (!validatedData.success) {
      console.log("Validation errors:", validatedData.error.format());
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: validatedData.error.errors
              .map((e) => e.message)
              .join(", "),
          },
        },
        { status: 400 }
      );
    }

    const result = await modifyEvent(db, eventId, validatedData.data);
    console.log("Update result:", result);

    if (!result.success) {
      console.log("Update failed:", result.error);
      return c.json(
        { error: result.error },
        { status: result.error.code === "EVENT_NOT_FOUND" ? 404 : 400 }
      );
    }

    return c.json(result.data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return c.json(
      {
        error: {
          code: "UPDATE_FAILED",
          message: error instanceof Error ? error.message : "Update failed",
        },
      },
      { status: 500 }
    );
  }
});

app.delete("/by-id/:eventId", async (c) => {
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

  return c.json({ success: true }, { status: 200 });
});

export default app;
