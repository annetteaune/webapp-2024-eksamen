"use client";
import Loader from "@/components/Loader";
import { useBookingForm } from "../hooks/useBookingForm";

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
  const {
    attendees,
    isSubmitting,
    submitError,
    submitSuccess,
    event,
    bookingHandler,
    addAttendee,
    removeAttendee,
    updateAttendee,
    handleSubmit,
  } = useBookingForm({ eventId, eventSlug });

  if (!event) {
    return <Loader />;
  }
  const bookingStatus = bookingHandler
    ? bookingHandler.getBookingStatus(attendees.length)
    : {
        canBook: true,
        availableSpots: event.capacity,
        mustUseWaitlist: false,
        message:
          event.price > 0 ? `Pris: ${event.price} kr` : "Gratis arrangement",
        totalPrice: event.price * attendees.length,
      };
  if (!bookingStatus.canBook && !event.allowWaitlist) {
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
        <Loader />
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
                    onChange={(e) =>
                      updateAttendee(index, "name", e.target.value)
                    }
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
                    onChange={(e) =>
                      updateAttendee(index, "email", e.target.value)
                    }
                    disabled={isSubmitting}
                  />
                </label>
              </div>
              {attendees.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAttendee(index)}
                  className="remove-attendee-btn btn"
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
                className="add-attendee-btn btn"
                disabled={isSubmitting}
              >
                Legg til deltaker
              </button>
            )}
          {event.price > 0 && (
            <div className="price-info">
              Total pris: {bookingStatus.totalPrice} kr
            </div>
          )}
        </div>
        <button
          type="submit"
          className="submit-btn btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sender..." : "Meld på"}
        </button>
      </form>
    </>
  );
}
