"use client";
import EventCard from "./EventCard";
import Loader from "@/components/Loader";
import { useEventList } from "../hooks/useEventList";

export default function EventList() {
  const { events, isLoading, error } = useEventList();

  if (isLoading) return <Loader />;
  if (error) return <div className="loading-text">Feil under innlasting</div>;
  if (!events.length)
    return <div className="loading-text">Ingen arrangementer funnet</div>;

  return (
    <>
      <h2 className="page-title">Alle arrangementer</h2>
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
    </>
  );
}
