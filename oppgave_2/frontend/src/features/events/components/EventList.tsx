import { EventsResponse } from "../interfaces";
import EventCard from "./EventCard";
import { fetcher } from "@/api/fetcher";

async function getEvents() {
  try {
    const data = await fetcher<EventsResponse>("/events");
    return data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

export default async function EventList() {
  try {
    const { events } = await getEvents();

    if (!events.length) {
      return <div>No events found</div>;
    }

    return (
      <section className="event-list">
        {events.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            slug={event.slug}
            title={event.title}
            type={event.type}
            date={event.date}
            location={event.location}
            description={event.descriptionShort}
            capacity={event.capacity}
            status={event.status}
          />
        ))}
      </section>
    );
  } catch (error) {
    return <div>Error loading events</div>;
  }
}
