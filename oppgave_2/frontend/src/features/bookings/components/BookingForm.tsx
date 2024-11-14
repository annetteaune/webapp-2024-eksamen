"use client";
import { useEffect, useState } from "react";
import { useBookings } from "../hooks/useBookings";
import { useBookingHandler } from "../hooks/useBookingHandler";
import { fetcher } from "@/api/fetcher";
import type { Event } from "@/features/events/interfaces";
import type { Booking } from "@/features/bookings/interfaces";
import type { Template } from "@/features/templates/interfaces";

type Attendee = {
  name: string;
  email: string;
};

type BookingFormProps = {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
};

export default function BookingForm({
  eventId,
  eventTitle,
  eventSlug,
}: BookingFormProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([
    { name: "", email: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const { createBooking } = useBookings();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await fetcher<Event>(`/events/slug/${eventSlug}`);
        if (!eventData) {
          throw new Error("Event not found");
        }
        setEvent(eventData);

        try {
          const [templateData, bookingsResponse] = await Promise.all([
            fetcher<Template>(`/templates/${eventData.templateId}`),
            fetcher<{ bookings: Booking[] }>(`/bookings/${eventSlug}`),
          ]);

          setTemplate(templateData);
          setBookings(
            bookingsResponse?.bookings
              ? Array.from(bookingsResponse.bookings)
              : []
          );
        } catch (error) {
          console.error("Error fetching template or bookings:", error);
          setBookings([]);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setSubmitError("Kunne ikke laste arrangementsinformasjon");
      } finally {
      }
    };

    fetchData();
  }, [eventSlug]);

  const bookingHandler =
    event && template ? useBookingHandler(event, template, bookings) : null;

  const addAttendee = () => {
    if (bookingHandler) {
      const status = bookingHandler.getBookingStatus(attendees.length + 1);
      if (!status.canBook) {
        setSubmitError(status.message);
        return;
      }
    }
    setAttendees([...attendees, { name: "", email: "" }]);
  };

  //claude.ai
  const removeAttendee = (index: number) => {
    if (attendees.length > 1) {
      const newAttendees = attendees.filter((_, i) => i !== index);
      setAttendees(newAttendees);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingHandler || !event) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const status = bookingHandler.getBookingStatus(attendees.length);
    if (!status.canBook) {
      setSubmitError(status.message);
      setIsSubmitting(false);
      return;
    }

    try {
      for (const attendee of attendees) {
        const validation = await bookingHandler.validateBooking({
          event_id: eventId,
          name: attendee.name,
          email: attendee.email,
        });

        if (!validation.success) {
          throw new Error(validation.error);
        }

        await createBooking({
          ...validation.data,
        });
      }

      setSubmitSuccess(true);
      setAttendees([{ name: "", email: "" }]);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Feil ved påmelding"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event || !template || !bookingHandler) {
    return <div>Laster inn...</div>;
  }

  const bookingStatus = bookingHandler.getBookingStatus(attendees.length);

  if (!bookingStatus.canBook && !template.allowWaitlist) {
    return (
      <div className="booking-closed">Det er ingen ledige plasser igjen.</div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="booking-success">
        <h3>Påmelding mottatt!</h3>
        <p>Takk for din påmelding til {eventTitle}.</p>
        <p>Du vil motta en bekreftelse på e-post.</p>
        <button
          onClick={() => {
            setSubmitSuccess(false);
            setAttendees([{ name: "", email: "" }]);
          }}
          className="new-booking-btn"
        >
          Registrer ny påmelding
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="page-title">
        {bookingStatus.mustUseWaitlist
          ? "Påmelding til venteliste"
          : "Påmeldingsskjema"}
      </h2>

      <form onSubmit={handleSubmit} className="booking-form">
        {submitError && <div className="error-message">{submitError}</div>}

        <div className="attendees-section">
          {attendees.map((attendee, index) => (
            <div key={index} className="attendee-form">
              <h4>Deltaker {index + 1}</h4>
              <div className="form-row">
                <label>
                  Navn:
                  <input
                    type="text"
                    required
                    value={attendee.name}
                    onChange={(e) => {
                      const newAttendees = [...attendees];
                      newAttendees[index].name = e.target.value;
                      setAttendees(newAttendees);
                    }}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  E-post:
                  <input
                    type="email"
                    required
                    value={attendee.email}
                    onChange={(e) => {
                      const newAttendees = [...attendees];
                      newAttendees[index].email = e.target.value;
                      setAttendees(newAttendees);
                    }}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
              {attendees.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAttendee(index)}
                  className="remove-attendee-btn"
                  disabled={isSubmitting}
                >
                  Fjern deltaker
                </button>
              )}
            </div>
          ))}
          {!bookingStatus.mustUseWaitlist &&
            bookingStatus.availableSpots > attendees.length && (
              <button
                type="button"
                onClick={addAttendee}
                className="add-attendee-btn"
                disabled={isSubmitting}
              >
                Legg til deltaker
              </button>
            )}{" "}
          {event.price > 0 && (
            <div className="price-info">
              Total pris: {bookingHandler.calculateTotalPrice(attendees.length)}{" "}
              kr
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Sender..." : "Meld på"}
        </button>
      </form>
    </>
  );
}
