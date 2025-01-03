import { type Event } from "../helpers";

export const toEventResponse = (event: Event) => ({
  id: event.id,
  slug: event.slug,
  title: event.title,
  descriptionShort: event.description_short,
  descriptionLong: event.description_long,
  date: event.date,
  location: event.location,
  type: {
    id: event.type_id,
    name: event.type_name,
  },
  capacity: event.capacity,
  price: event.price,
  templateId: event.template_id,
  status: event.status,
  isPrivate: event.is_private,
  allowSameDay: event.allow_same_day,
  allowWaitlist: event.allow_waitlist,
  waitlist: event.waitlist,
});

export const toEventsResponse = (events: Event[]) => ({
  events: events.map(toEventResponse),
});
