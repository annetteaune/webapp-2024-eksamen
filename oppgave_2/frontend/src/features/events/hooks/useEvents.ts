"use client";
import { useState, useEffect } from "react";
import { fetcher } from "@/api/fetcher";
import { Event, EventsResponse } from "../interfaces";
import { endpoints } from "@/api/urls";

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetcher<EventsResponse>(endpoints.events.base);
        setEvents(response.events);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch events")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, isLoading, error };
};
