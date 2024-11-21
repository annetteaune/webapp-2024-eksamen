"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Event, EventsResponse } from "../interfaces";
import EventCard from "./EventCard";
import { fetcher } from "@/api/fetcher";
import { useTypes } from "@/features/types/hooks/useTypes";

const getTypeSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/\s+/g, "-");
};

export default function EventList() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { types } = useTypes();

  useEffect(() => {
    const getEvents = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams(searchParams);

        const typeSlug = params.get("type");
        if (typeSlug && types.length > 0) {
          const type = types.find((t) => getTypeSlug(t.name) === typeSlug);
          if (type) {
            params.set("type", type.id);
          }
        }

        const queryString = params.toString();
        const data = await fetcher<EventsResponse>(
          `/events${queryString ? `?${queryString}` : ""}`
        );

        const publicEvents = data.events.filter((event) => !event.isPrivate);
        setEvents(publicEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(
          error instanceof Error ? error : new Error("Failed to fetch events")
        );
      } finally {
        setIsLoading(false);
      }
    };

    getEvents();
  }, [searchParams, types]);

  if (isLoading) return <div className="loading-text">Laster inn...</div>;
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
