import { useState, useEffect } from "react";
import { fetcher } from "@/api/fetcher";
import { Event } from "@/features/events/interfaces";
import { Booking } from "@/features/bookings/interfaces";
import { endpoints } from "@/api/urls";

type BookingStatus =
  | "Godkjent"
  | "Til behandling"
  | "På venteliste"
  | "Avslått";

export const useBookingsAdmin = (slug: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showManualBookingForm, setShowManualBookingForm] = useState(false);

  const fetchData = async () => {
    try {
      const [eventData, bookingsData] = await Promise.all([
        fetcher<Event>(endpoints.events.bySlug(slug)),
        fetcher<{ bookings: Booking[] }>(endpoints.bookings.bySlug(slug)),
      ]);
      setEvent(eventData);
      setBookings(bookingsData.bookings);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Kunne ikke laste inn data");
    }
  };
  useEffect(() => {
    fetchData();
  }, [slug]);

  // claude.ai
  const handleUpdateBooking = async (
    bookingId: string,
    status: BookingStatus,
    hasPaid: boolean
  ) => {
    try {
      if (status === "Til behandling") {
        if (
          !window.confirm("Er du sikker på at du vil slette denne påmeldingen?")
        ) {
          return;
        }

        const response = await fetch(endpoints.bookings.byId(bookingId), {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: { message: "Kunne ikke slette påmeldingen" },
          }));
          throw new Error(errorData.error.message);
        }

        setBookings((prevBookings) =>
          prevBookings.filter((booking) => booking.id !== bookingId)
        );
      } else {
        const response = await fetch(endpoints.bookings.byId(bookingId), {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            has_paid: hasPaid,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Kunne ikke oppdatere påmeldingen"
          );
        }

        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === bookingId
              ? {
                  ...booking,
                  status,
                  hasPaid,
                }
              : booking
          )
        );
      }
      await fetchData();
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error updating booking:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Kunne ikke oppdatere påmeldingen";
      setError(errorMessage);
      throw error;
    }
  };

  // claude.ai
  const getBookingCounts = () => {
    const approvedBookings = bookings.filter(
      (b) => b.status === "Godkjent"
    ).length;
    const pendingBookings = bookings.filter(
      (b) => b.status === "Til behandling"
    ).length;

    return {
      approved: approvedBookings,
      pending: pendingBookings,
    };
  };

  return {
    event,
    bookings,
    selectedBooking,
    error,
    showManualBookingForm,
    setSelectedBooking,
    setError,
    setShowManualBookingForm,
    handleUpdateBooking,
    fetchData,
    getBookingCounts,
  };
};
