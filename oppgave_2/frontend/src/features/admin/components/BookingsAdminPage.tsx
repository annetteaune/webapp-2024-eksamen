"use client";
import { useState, useEffect } from "react";
import { fetcher } from "@/api/fetcher";
import { Event } from "@/features/events/interfaces";
import { Booking } from "@/features/bookings/interfaces";
import Link from "next/link";
import ErrorMessage from "@/components/ErrorMessage";
import { BookingsCard } from "./BookingsCard";
import { BookingAdminForm } from "./BookingAdminForm";
import AddManualBooking from "./AddManualBooking";
import { ManualBookingForm } from "./ManualBookingForm";

type BookingStatus =
  | "Godkjent"
  | "Til behandling"
  | "På venteliste"
  | "Avslått";

export default function BookingsAdminPage({
  params,
}: {
  params: { slug: string };
}) {
  const [event, setEvent] = useState<Event | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showManualBookingForm, setShowManualBookingForm] = useState(false);

  const fetchData = async () => {
    try {
      const [eventData, bookingsData] = await Promise.all([
        fetcher<Event>(`/events/slug/${params.slug}`),
        fetcher<{ bookings: Booking[] }>(`/bookings/${params.slug}`),
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
  }, [params.slug]);

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

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3999"
          }/bookings/${bookingId}`,
          {
            method: "DELETE",
          }
        );

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
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3999"
          }/bookings/${bookingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status,
              has_paid: hasPaid,
            }),
          }
        );

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

  const handleManualBookingSuccess = async () => {
    await fetchData();
  };

  if (!event) {
    return <div>Laster...</div>;
  }

  // claude.ai
  const approvedBookings = bookings.filter(
    (b) => b.status === "Godkjent"
  ).length;
  const pendingBookings = bookings.filter(
    (b) => b.status === "Til behandling"
  ).length;

  return (
    <div className="admin-bookings-page">
      <Link href="/admin" className="back-link">
        {"<"} Tilbake til administrasjonspanel
      </Link>

      <h2 className="page-title">Håndter påmeldinger</h2>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      <div className="event-info-card">
        <h3>{event.title}</h3>
        <div className="event-details">
          <p>Status: {event.status}</p>
          <p>Godkjente påmeldinger: {approvedBookings}</p>
          <p>Påmeldinger til behandling: {pendingBookings}</p>
          <p>Kapasitet: {event.capacity}</p>
          <AddManualBooking onAdd={() => setShowManualBookingForm(true)} />
        </div>
      </div>

      <div className="bookings-grid">
        {bookings.map((booking) => (
          <BookingsCard
            key={booking.id}
            booking={booking}
            onManage={(booking) => setSelectedBooking(booking)}
          />
        ))}
      </div>

      {showManualBookingForm && event && (
        <ManualBookingForm
          event={event}
          onClose={() => setShowManualBookingForm(false)}
          onSuccess={handleManualBookingSuccess}
        />
      )}

      {selectedBooking && (
        <BookingAdminForm
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onSubmit={handleUpdateBooking}
        />
      )}
    </div>
  );
}
