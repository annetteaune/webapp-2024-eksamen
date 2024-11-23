import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { fetcher } from "@/api/fetcher";
import { Event, EventsResponse } from "../interfaces";
import { useTypes } from "@/features/types/hooks/useTypes";
import { getTypeSlug } from "../helpers/typeSlug";

export const useEventList = () => {
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

        const publicEvents = data.events
          .filter((event) => !event.isPrivate)
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
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

  return {
    events,
    isLoading,
    error,
  };
};
