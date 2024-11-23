import { type DB } from "../../../db/db";
import { type Result } from "../../../types";
import { generateUUID } from "../../../lib/uuid";
import {
  CreateEvent,
  DbEvent,
  Event,
  eventSchema,
  UpdateEvent,
} from "../helpers";

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

    const validatedEvents = events.map((event) => {
      try {
        return eventSchema.parse({
          ...event,
          is_private: Boolean(event.is_private),
          allow_same_day: Boolean(event.allow_same_day),
          allow_waitlist: Boolean(event.allow_waitlist),
          waitlist: event.waitlist ? JSON.parse(event.waitlist) : null,
          template_id: event.template_id || null,
          type: {
            id: event.type_id,
            name: event.type_name,
          },
        });
      } catch (error) {
        console.error("Validation error for event:", event.id, error);
        throw error;
      }
    });

    return {
      success: true,
      data: validatedEvents,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "EVENTS_NOT_FOUND",
        message: "Kunne ikke hente arrangementer",
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
      .prepare(
        `
      SELECT events.*, types.name as type_name
      FROM events 
      JOIN types ON events.type_id = types.id
      WHERE events.id = ?
    `
      )
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
    return {
      success: true,
      data: {
        ...event,
        is_private: Boolean(event.is_private),
        allow_same_day: Boolean(event.allow_same_day),
        allow_waitlist: Boolean(event.allow_waitlist),
        waitlist: event.waitlist ? JSON.parse(event.waitlist) : null,
        type_name: event.type_name,
      } as Event,
    };
  } catch (error) {
    console.error("Error finding event:", error);
    return {
      success: false,
      error: {
        code: "EVENT_FETCH_FAILED",
        message: `Could not fetch event ${eventId}`,
      },
    };
  }
};

// fått hjelp av claude.ai til å håndtere venteliste
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
          message: `Arrangement med slug ${slug} ikke funnet`,
        },
      };
    }

    const validatedEvent = eventSchema.parse({
      ...event,
      is_private: Boolean(event.is_private),
      allow_same_day: Boolean(event.allow_same_day),
      allow_waitlist: Boolean(event.allow_waitlist),
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
        message: `Kunne ikke hente arrangement med slug ${slug}`,
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
    let allowWaitlist = event.allow_waitlist || false;

    if (event.template_id) {
      const template = db
        .prepare(
          "SELECT is_private, allow_same_day, allow_waitlist FROM templates WHERE id = ?"
        )
        .get(event.template_id) as
        | { is_private: number; allow_same_day: number; allow_waitlist: number }
        | undefined;

      if (template) {
        isPrivate = template.is_private === 1 ? true : event.is_private;
        allowSameDay = Boolean(template.allow_same_day);
        allowWaitlist =
          template.allow_waitlist === 1 ? true : event.allow_waitlist ?? false;
      }
    }

    const newEvent = {
      id,
      ...event,
      status: "Ledige plasser",
      is_private: isPrivate,
      allow_same_day: allowSameDay,
      allow_waitlist: allowWaitlist,
      waitlist: null,
    };

    db.prepare(
      `
      INSERT INTO events (
        id, slug, title, description_short, description_long,
        date, location, type_id, capacity, price,
        template_id, status, is_private, allow_same_day, allow_waitlist, waitlist
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      newEvent.allow_waitlist ? 1 : 0,
      newEvent.waitlist ? JSON.stringify(newEvent.waitlist) : null
    );

    return {
      success: true,
      data: {
        ...newEvent,
        type: {
          id: newEvent.type_id,
          name: "",
        },
      } as unknown as Event,
    };
  } catch (error) {
    console.error("Event creation error:", error);
    return {
      success: false,
      error: {
        code: "EVENT_CREATE_FAILED",
        message: "Kunne ikke opprette arrangement",
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

    let isPrivate = update.is_private;
    let allowWaitlist = update.allow_waitlist;

    if (update.template_id) {
      const template = db
        .prepare(
          "SELECT is_private, allow_same_day, allow_waitlist FROM templates WHERE id = ?"
        )
        .get(update.template_id) as
        | { is_private: number; allow_same_day: number; allow_waitlist: number }
        | undefined;

      if (template) {
        isPrivate = template.is_private === 1 ? true : update.is_private;
        allowWaitlist =
          template.allow_waitlist === 1 ? true : update.allow_waitlist;
      }
    }

    const updatedEvent = {
      ...existingResult.data,
      ...update,
      template_id: update.template_id ?? existingResult.data.template_id,
      is_private: isPrivate,
      allow_same_day:
        update.allow_same_day ?? existingResult.data.allow_same_day,
      allow_waitlist: allowWaitlist,
      status: update.status ?? existingResult.data.status,
    };

    db.prepare(
      `
      UPDATE events 
      SET slug = ?, title = ?, description_short = ?, description_long = ?,
          date = ?, location = ?, type_id = ?, capacity = ?, price = ?,
          template_id = ?, status = ?, is_private = ?, allow_same_day = ?,
          allow_waitlist = ?
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
      updatedEvent.allow_waitlist ? 1 : 0,
      eventId
    );

    const type = db
      .prepare("SELECT name FROM types WHERE id = ?")
      .get(updatedEvent.type_id) as { name: string };
    return {
      success: true,
      data: {
        ...updatedEvent,
        type_name: type.name,
      } as Event,
    };
  } catch (error) {
    console.error("Update event error:", error);
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
    const bookings = db
      .prepare("SELECT COUNT(*) as count FROM bookings WHERE event_id = ?")
      .get(eventId) as { count: number };

    if (bookings.count > 0) {
      return {
        success: false,
        error: {
          code: "EVENT_HAS_BOOKINGS",
          message: "Kan ikke slette arrangementer som har påmeldinger.",
        },
      };
    }
    const result = db.prepare("DELETE FROM events WHERE id = ?").run(eventId);

    if (result.changes === 0) {
      return {
        success: false,
        error: {
          code: "EVENT_NOT_FOUND",
          message: `Arrangement ${eventId} ikke funnet.`,
        },
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Error in deleteEvent:", error);
    throw error;
  }
};
