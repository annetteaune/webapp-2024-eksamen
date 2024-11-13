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
  capacity: number;
  price: number;
  template_id: string;
  status: string;
  waitlist: string | null;
};

export const findAllEvents = async (db: DB): Promise<Result<Event[]>> => {
  try {
    const events = db.prepare("SELECT * FROM events").all() as DbEvent[];

    const validatedEvents = events.map((event) =>
      eventSchema.parse({
        ...event,
        waitlist: event.waitlist ? JSON.parse(event.waitlist) : null,
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
      .prepare("SELECT * FROM events WHERE slug = ?")
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
    const newEvent = eventSchema.parse({
      id,
      ...event,
      status: "Ledig",
      waitlist: null,
    });

    db.prepare(
      `
      INSERT INTO events (
        id, slug, title, description_short, description_long,
        date, location, type_id, capacity, price,
        template_id, status, waitlist
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      newEvent.waitlist ? JSON.stringify(newEvent.waitlist) : null
    );

    return {
      success: true,
      data: newEvent,
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
