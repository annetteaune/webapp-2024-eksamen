import { useState, useEffect } from "react";
import { Event } from "@/features/events/interfaces";
import { Booking } from "@/features/bookings/interfaces";
import { fetcher } from "@/api/fetcher";
import { endpoints } from "@/api/urls";

type EventBookings = {
  event: Event;
  bookings: {
    approved: number;
    pending: number;
    waitlist: number;
    total: number;
  };
};

export const useBookingsList = () => {
  const [eventBookings, setEventBookings] = useState<EventBookings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await fetcher<{ events: Event[] }>(
          endpoints.events.filtered({ includePrivate: "true" })
        );
        const events = eventsResponse.events;

        const bookingsData = await Promise.all(
          events.map(async (event) => {
            const bookingsResponse = await fetcher<{ bookings: Booking[] }>(
              endpoints.bookings.bySlug(event.slug)
            );
            const bookings = bookingsResponse.bookings;

            return {
              event,
              bookings: {
                approved: bookings.filter((b) => b.status === "Godkjent")
                  .length,
                pending: bookings.filter((b) => b.status === "Til behandling")
                  .length,
                waitlist: bookings.filter((b) => b.status === "På venteliste")
                  .length,
                total: bookings.length,
              },
            };
          })
        );

        setEventBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    eventBookings,
    isLoading,
  };
};
