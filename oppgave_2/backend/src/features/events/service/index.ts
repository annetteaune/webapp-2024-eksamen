import { type DB } from "@/db/db";
import {
  findAllEvents,
  findEventById,
  findEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../repository";
import { toEventResponse, toEventsResponse } from "../mappers";
import { type Result } from "@/types";
import { CreateEvent, UpdateEvent } from "../helpers";

type EventResponse = ReturnType<typeof toEventResponse>;
type EventsResponse = ReturnType<typeof toEventsResponse>;

type FilterParams = {
  typeId?: string;
  month?: string;
  year?: string;
  includePrivate?: boolean;
};

export const getEvents = async (
  db: DB,
  filters?: FilterParams
): Promise<Result<EventsResponse>> => {
  const result = await findAllEvents(db, {
    ...filters,
    includePrivate: filters?.includePrivate,
  });
  if (!result.success) {
    return result;
  }
  return {
    success: true,
    data: toEventsResponse(result.data),
  };
};

export const getEvent = async (
  db: DB,
  eventId: string
): Promise<Result<EventResponse>> => {
  const result = await findEventById(db, eventId);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: toEventResponse(result.data),
  };
};

export const getEventBySlug = async (
  db: DB,
  slug: string
): Promise<Result<EventResponse>> => {
  const result = await findEventBySlug(db, slug);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: toEventResponse(result.data),
  };
};

export const addEvent = async (
  db: DB,
  event: CreateEvent
): Promise<Result<EventResponse>> => {
  const result = await createEvent(db, event);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: toEventResponse(result.data),
  };
};

export const modifyEvent = async (
  db: DB,
  eventId: string,
  update: UpdateEvent
): Promise<Result<EventResponse>> => {
  const result = await updateEvent(db, eventId, update);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: toEventResponse(result.data),
  };
};

export const removeEvent = async (
  db: DB,
  eventId: string
): Promise<Result<void>> => {
  try {
    const result = await deleteEvent(db, eventId);
    return result;
  } catch (error) {
    console.error("Error in removeEvent:", error);
    return {
      success: false,
      error: {
        code: "EVENT_DELETE_FAILED",
        message: `Kunne ikke slette arrangementet ${eventId}`,
      },
    };
  }
};
