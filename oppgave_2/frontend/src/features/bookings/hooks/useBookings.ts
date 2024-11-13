import { fetcher } from "@/api/fetcher";
import { useEffect, useState } from "react";
import { Booking, BookingsResponse, CreateBookingData } from "../interfaces";

export function useBookings(eventId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const response = await fetcher<BookingsResponse>(
          eventId ? `/bookings/${eventId}` : "/bookings"
        );
        setBookings(response.bookings);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch bookings")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [eventId]);

  const createBooking = async (data: CreateBookingData) => {
    try {
      const response = await fetcher<Booking>("/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setBookings((prev) => [...prev, response]);
      return response;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to create booking");
    }
  };

  return { bookings, isLoading, error, createBooking };
}
