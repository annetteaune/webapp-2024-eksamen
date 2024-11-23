"use client";
import { FaUsers } from "react-icons/fa";
import Loader from "@/components/Loader";
import { useBookingsList } from "../hooks/useBookingsList";

const BookingsList = () => {
  const { eventBookings, isLoading } = useBookingsList();

  if (isLoading) return <Loader />;

  return (
    <div className="bookings-section">
      <h3>Påmeldinger </h3>
      <div className="bookings-grid">
        {eventBookings.map(({ event, bookings }) => (
          <div key={event.id} className="bookings-card">
            <div className="bookings-info">
              <h4>{event.title}</h4>
              <p>
                <span>Godkjente: {bookings.approved} | </span>
                <span>Til behandling: {bookings.pending}</span>
                {event.allowWaitlist && (
                  <span> | Venteliste: {bookings.waitlist}</span>
                )}
              </p>
              <p>
                Kapasitet: {event.capacity} | Totalt påmeldte: {bookings.total}
              </p>
            </div>
            <div className="bookings-actions">
              <button
                className="icon-btn users"
                onClick={() =>
                  (window.location.href = `/admin/${event.slug}/bookings`)
                }
              >
                <FaUsers />
                <span className="tooltip">Håndter påmeldinger</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingsList;
