import { type DB } from "../../../db/db";
import { type Result } from "../../../types";
import { generateUUID } from "../../../lib/uuid";
import {
  DbEvent,
  eventSchema,
  Event,
  CreateEvent,
  UpdateEvent,
} from "../helpers";

// har fått hjelp av claude.ai til å skrive queries for filtrering
// filtrerer også på templateID, for å unngå error i console-loggen ved forsøk på sletting av template i bruk
export const findAllEvents = async (
  db: DB,
  filters?: {
    typeId?: string;
    month?: string;
    year?: string;
    templateId?: string;
  }
): Promise<Result<Event[]>> => {
  try {
    let query = `
      SELECT 
        events.*,
        types.name as type_name,
        templates.allow_waitlist as template_allow_waitlist
      FROM events 
      LEFT JOIN types ON events.type_id = types.id
      LEFT JOIN templates ON events.template_id = templates.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    if (filters?.typeId) {
      query += ` AND events.type_id = ?`;
      queryParams.push(filters.typeId);
    }

    if (filters?.month) {
      query += ` AND strftime('%m', events.date) = ?`;
      queryParams.push(filters.month.padStart(2, "0"));
    }

    if (filters?.year) {
      query += ` AND strftime('%Y', events.date) = ?`;
      queryParams.push(filters.year);
    }

    if (filters?.templateId) {
      query += ` AND events.template_id = ?`;
      queryParams.push(filters.templateId);
    }

    console.log("Executing query:", query, "with params:", queryParams);

    const events = db.prepare(query).all(...queryParams) as DbEvent[];
    console.log("Raw events data:", events);

    const validatedEvents = events.map((event) => {
      const type = {
        id: event.type_id,
        name: event.type_name || "Unknown Type",
      };

      const transformedEvent = {
        ...event,
        waitlist: event.waitlist ? JSON.parse(event.waitlist) : null,
        type,
        template_id: event.template_id || null,
        allow_waitlist: Boolean(event.allow_waitlist),
      };

      console.log("Transformed event before validation:", transformedEvent);

      return eventSchema.parse(transformedEvent);
    });

    console.log("Validated events:", validatedEvents);

    return {
      success: true,
      data: validatedEvents,
    };
  } catch (error) {
    console.error("Error in findAllEvents:", error);
    return {
      success: false,
      error: {
        code: "EVENTS_NOT_FOUND",
        message: "Could not fetch events",
      },
    };
  }
};

export const findEventById = async (
  db: DB,
  eventId: string
): Promise<Result<Event>> => {
  try {
    const event = db
      .prepare("SELECT * FROM events WHERE id = ?")
      .get(eventId) as DbEvent | undefined;

    if (!event) {
      return {
        success: false,
        error: {
          code: "EVENT_NOT_FOUND",
          message: `Event ${eventId} not found`,
        },
      };
    }
    const validatedEvent = eventSchema.parse({
      ...event,
      waitlist: event.waitlist ? JSON.parse(event.waitlist) : null,
    });
    return {
      success: true,
      data: validatedEvent,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "EVENT_FETCH_FAILED",
        message: `Could not fetch event ${eventId}`,
      },
    };
  }
};

export const findEventBySlug = async (
  db: DB,
  slug: string
): Promise<Result<Event>> => {
  try {
    const event = db
      .prepare(
        `
        SELECT events.*, types.name as type_name 
        FROM events 
        JOIN types ON events.type_id = types.id
        WHERE events.slug = ?
      `
      )
      .get(slug) as DbEvent | undefined;
    if (!event) {
      return {
        success: false,
        error: {
          code: "EVENT_NOT_FOUND",
          message: `Event with slug ${slug} not found`,
        },
      };
    }
    const validatedEvent = eventSchema.parse({
      ...event,
      waitlist: event.waitlist ? JSON.parse(event.waitlist) : null,
      type: {
        id: event.type_id,
        name: event.type_name,
      },
    });
    return {
      success: true,
      data: validatedEvent,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "EVENT_FETCH_FAILED",
        message: `Could not fetch event with slug ${slug}`,
      },
    };
  }
};

export const createEvent = async (
  db: DB,
  event: CreateEvent
): Promise<Result<Event>> => {
  try {
    const id = generateUUID();
    const typeInfo = db
      .prepare("SELECT name FROM types WHERE id = ?")
      .get(event.type_id) as { name: string } | undefined;
    if (!typeInfo) {
      return {
        success: false,
        error: {
          code: "TYPE_NOT_FOUND",
          message: "Could not find event type",
        },
      };
    }
    let allowWaitlist = event.allow_waitlist || false;
    if (event.template_id) {
      const template = db
        .prepare("SELECT allow_waitlist FROM templates WHERE id = ?")
        .get(event.template_id) as { allow_waitlist: number } | undefined;
      if (template) {
        allowWaitlist = Boolean(template.allow_waitlist);
      }
    }
    const newEvent = {
      id,
      ...event,
      type_name: typeInfo.name,
      allow_waitlist: allowWaitlist,
      status: "Ledige plasser" as const,
      waitlist: null,
    };
    try {
      db.prepare(
        `
        INSERT INTO events (
          id, slug, title, description_short, description_long,
          date, location, type_id, capacity, price,
          template_id, status, waitlist, allow_waitlist
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      ).run(
        newEvent.id,
        newEvent.slug,
        newEvent.title,
        newEvent.description_short,
        newEvent.description_long,
        newEvent.date,
        newEvent.location,
        newEvent.type_id,
        newEvent.capacity,
        newEvent.price,
        newEvent.template_id || null,
        newEvent.status,
        newEvent.waitlist ? JSON.stringify(newEvent.waitlist) : null,
        newEvent.allow_waitlist ? 1 : 0
      );
      return {
        success: true,
        data: newEvent as Event,
      };
    } catch (insertError) {
      console.error("Database insertion error:", insertError);
      throw insertError;
    }
  } catch (error) {
    console.error("Event creation error:", error);
    return {
      success: false,
      error: {
        code: "EVENT_CREATE_FAILED",
        message: "Could not create event",
      },
    };
  }
};

export const updateEvent = async (
  db: DB,
  eventId: string,
  update: UpdateEvent
): Promise<Result<Event>> => {
  try {
    const existingResult = await findEventById(db, eventId);
    if (!existingResult.success) {
      return existingResult;
    }
    const updatedEvent = eventSchema.parse({
      ...existingResult.data,
      ...update,
    });
    db.prepare(
      `
      UPDATE events 
      SET slug = ?, title = ?, description_short = ?, description_long = ?,
          date = ?, location = ?, type_id = ?, capacity = ?, price = ?,
          template_id = ?, status = ?
      WHERE id = ?
    `
    ).run(
      updatedEvent.slug,
      updatedEvent.title,
      updatedEvent.description_short,
      updatedEvent.description_long,
      updatedEvent.date,
      updatedEvent.location,
      updatedEvent.type_id,
      updatedEvent.capacity,
      updatedEvent.price,
      updatedEvent.template_id,
      updatedEvent.status,
      eventId
    );
    return {
      success: true,
      data: updatedEvent,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "EVENT_UPDATE_FAILED",
        message: `Could not update event ${eventId}`,
      },
    };
  }
};

export const deleteEvent = async (
  db: DB,
  eventId: string
): Promise<Result<void>> => {
  try {
    const event = db.prepare("SELECT id FROM events WHERE id = ?").get(eventId);

    if (!event) {
      return {
        success: false,
        error: {
          code: "EVENT_NOT_FOUND",
          message: `Event ${eventId} not found`,
        },
      };
    }
    const bookings = db
      .prepare("SELECT COUNT(*) as count FROM bookings WHERE event_id = ?")
      .get(eventId) as { count: number };

    if (bookings.count > 0) {
      return {
        success: false,
        error: {
          code: "EVENT_HAS_BOOKINGS",
          message: "Cannot delete event that has bookings",
        },
      };
    }
    db.prepare("DELETE FROM events WHERE id = ?").run(eventId);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Database error during event deletion:", error);
    return {
      success: false,
      error: {
        code: "EVENT_DELETE_FAILED",
        message: `Could not delete event ${eventId}`,
      },
    };
  }
};
