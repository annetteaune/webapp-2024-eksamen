"use client";
import { useState, useEffect } from "react";
import { Event } from "@/features/events/interfaces";
import { Booking } from "@/features/bookings/interfaces";
import { fetcher } from "@/api/fetcher";
import { FaUsers } from "react-icons/fa";
import Loader from "@/components/Loader";

type EventBookings = {
  event: Event;
  bookings: {
    approved: number;
    pending: number;
    waitlist: number;
    total: number;
  };
};

const BookingsList = () => {
  const [eventBookings, setEventBookings] = useState<EventBookings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await fetcher<{ events: Event[] }>(
          "/events?includePrivate=true"
        );
        const events = eventsResponse.events;

        const bookingsData = await Promise.all(
          events.map(async (event) => {
            const bookingsResponse = await fetcher<{ bookings: Booking[] }>(
              `/bookings/${event.slug}`
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
