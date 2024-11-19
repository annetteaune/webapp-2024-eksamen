import { type DB } from "@/db/db";
import {
  findAllEvents,
  findEventById,
  findEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
  type CreateEvent,
  type UpdateEvent,
} from "../repository";
import { toEventResponse, toEventsResponse } from "../mappers";
import { type Result } from "@/types";

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
  return await deleteEvent(db, eventId);
};
