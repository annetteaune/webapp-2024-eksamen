"use client";

import Link from "next/link";
import ErrorMessage from "@/components/ErrorMessage";
import { BookingsCard } from "./BookingsCard";
import { BookingAdminForm } from "./BookingAdminForm";
import AddManualBooking from "./AddManualBooking";
import { ManualBookingForm } from "./ManualBookingForm";
import Loader from "@/components/Loader";
import { useBookingsAdmin } from "../hooks/useBookingsAdmin";

export default function BookingsAdminPage({
  params,
}: {
  params: { slug: string };
}) {
  const {
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
  } = useBookingsAdmin(params.slug);

  if (!event) {
    return <Loader />;
  }

  const { approved: approvedBookings, pending: pendingBookings } =
    getBookingCounts();

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
          onSuccess={fetchData}
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
