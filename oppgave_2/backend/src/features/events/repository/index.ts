import { type DB } from "../../../db/db";
import { type Result } from "../../../types";
import { generateUUID } from "../../../lib/uuid";
import {
  eventSchema,
  type createEventSchema,
  type updateEventSchema,
} from "../helpers";
import { z } from "zod";

export type Event = z.infer<typeof eventSchema>;
export type CreateEvent = z.infer<typeof createEventSchema>;
export type UpdateEvent = z.infer<typeof updateEventSchema>;

type DbEvent = {
  id: string;
  slug: string;
  title: string;
  description_short: string;
  description_long: string;
  date: string;
  location: string;
  type_id: string;
  type_name: string;
  capacity: number;
  price: number;
  template_id: string;
  status: string;
  is_private: number;
  allow_same_day: number;
  waitlist: string | null;
};

// har fått hjelp av claude.ai til å skrive queries for filtrering
// filtrerer også på templateID, for å unngå error i console-loggen ved forsøk på sletting av template i bruk,
// samt private arrangementer
export const findAllEvents = async (
  db: DB,
  filters?: {
    typeId?: string;
    month?: string;
    year?: string;
    templateId?: string;
    includePrivate?: boolean;
  }
): Promise<Result<Event[]>> => {
  try {
    let query = `
      SELECT events.*, types.name as type_name 
      FROM events 
      JOIN types ON events.type_id = types.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    if (!filters?.includePrivate) {
      query += ` AND (events.is_private = 0 OR events.is_private IS NULL)`;
    }

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

    const events = db.prepare(query).all(...queryParams) as DbEvent[];

    const validatedEvents = events.map((event) =>
      eventSchema.parse({
        ...event,
        is_private: Boolean(event.is_private),
        allow_same_day: Boolean(event.allow_same_day),
        waitlist: event.waitlist ? JSON.parse(event.waitlist) : null,
        type: {
          id: event.type_id,
          name: event.type_name,
        },
      })
    );

    return {
      success: true,
      data: validatedEvents,
    };
  } catch (error) {
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
      is_private: Boolean(event.is_private),
      allow_same_day: Boolean(event.allow_same_day),
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
      is_private: Boolean(event.is_private),
      allow_same_day: Boolean(event.allow_same_day),
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
    console.error("Error in findEventBySlug:", error);
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

    let isPrivate = event.is_private;
    let allowSameDay = event.allow_same_day;

    if (event.template_id) {
      const template = db
        .prepare(
          "SELECT is_private, allow_same_day FROM templates WHERE id = ?"
        )
        .get(event.template_id) as
        | { is_private: number; allow_same_day: number }
        | undefined;

      if (template) {
        isPrivate = Boolean(template.is_private);
        allowSameDay = Boolean(template.allow_same_day);
      }
    }
    const newEvent = {
      id,
      ...event,
      status: "Ledige plasser",
      is_private: isPrivate,
      allow_same_day: allowSameDay,
      waitlist: null,
    };

    db.prepare(
      `
      INSERT INTO events (
        id, slug, title, description_short, description_long,
        date, location, type_id, capacity, price,
        template_id, status, is_private, allow_same_day, waitlist
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      newEvent.template_id,
      newEvent.status,
      newEvent.is_private ? 1 : 0,
      newEvent.allow_same_day ? 1 : 0,
      newEvent.waitlist ? JSON.stringify(newEvent.waitlist) : null
    );

    // konverterer tilbake til camelCase from frontend
    return {
      success: true,
      data: {
        ...newEvent,
        descriptionShort: newEvent.description_short,
        descriptionLong: newEvent.description_long,
        typeId: newEvent.type_id,
        templateId: newEvent.template_id,
        isPrivate: Boolean(newEvent.is_private),
        allowSameDay: Boolean(newEvent.allow_same_day),
      } as unknown as Event,
    };
  } catch (error) {
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
          template_id = ?, status = ?, is_private = ?, allow_same_day = ?
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
      updatedEvent.is_private ? 1 : 0,
      updatedEvent.allow_same_day ? 1 : 0,
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
    // hvis bookings for eventet
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
    const result = db.prepare("DELETE FROM events WHERE id = ?").run(eventId);
    if (result.changes === 0) {
      return {
        success: false,
        error: {
          code: "EVENT_NOT_FOUND",
          message: `Event ${eventId} not found`,
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
        code: "EVENT_DELETE_FAILED",
        message: `Could not delete event ${eventId}`,
      },
    };
  }
};
