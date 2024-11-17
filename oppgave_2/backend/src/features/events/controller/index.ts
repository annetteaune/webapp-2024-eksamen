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
  try {
    const { type, month, year, template } = c.req.query();
    const filters = {
      typeId: type,
      month: month,
      year: year,
      templateId: template,
    };

    const result = await getEvents(db, filters);

    if (!result.success) {
      console.error("Error fetching events:", result.error);
      return c.json(
        {
          error: {
            code: result.error.code,
            message: result.error.message,
          },
        },
        { status: 500 }
      );
    }
    return c.json(result.data);
  } catch (error) {
    console.error("Unexpected error in events controller:", error);
    return c.json(
      {
        error: {
          code: "UNEXPECTED_ERROR",
          message: "An unexpected error occurred while fetching events",
        },
      },
      { status: 500 }
    );
  }
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
  try {
    const slug = c.req.param("slug");
    console.log("Backend: Received request for slug:", slug);

    const result = await getEventBySlug(db, slug);
    console.log("Backend: Query result:", result);

    if (!result.success) {
      console.log("Backend: Event not found or error:", result.error);
      return c.json(
        {
          error: {
            code: result.error.code,
            message: result.error.message,
            details: `Failed to find event with slug: ${slug}`,
          },
        },
        { status: result.error.code === "EVENT_NOT_FOUND" ? 404 : 500 }
      );
    }

    console.log("Backend: Found event:", result.data);
    return c.json(result.data);
  } catch (error) {
    console.error("Backend: Unexpected error:", error);
    return c.json(
      {
        error: {
          code: "UNEXPECTED_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          details: "Internal server error while fetching event",
        },
      },
      { status: 500 }
    );
  }
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Received event data:", body);
    // camelcase til snakecase
    const transformedData = {
      slug: body.slug,
      title: body.title,
      description_short: body.descriptionShort,
      description_long: body.descriptionLong,
      date: body.date,
      location: body.location,
      type_id: body.type?.id || body.typeId,
      capacity: Number(body.capacity),
      price: Number(body.price),
      template_id: body.templateId || null,
      allow_waitlist: body.allowWaitlist || false,
    };
    const validatedData = createEventSchema.parse(transformedData);
    const result = await addEvent(db, validatedData);
    if (!result.success) {
      console.error("Event creation failed:", result.error);
      return c.json(
        {
          error: {
            code: result.error.code,
            message: result.error.message,
          },
        },
        {
          status: 400,
        }
      );
    }
    return c.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Event creation error:", error);
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
  try {
    const eventId = c.req.param("eventId");
    console.log(`Attempting to delete event: ${eventId}`);

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
    return c.json(
      { success: true, message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return c.json(
      {
        error: {
          code: "UNEXPECTED_ERROR",
          message: "An unexpected error occurred while deleting the event",
        },
      },
      { status: 500 }
    );
  }
});

export default app;
