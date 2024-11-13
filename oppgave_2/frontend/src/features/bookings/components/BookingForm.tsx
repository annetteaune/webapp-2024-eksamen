"use client";
import { useState } from "react";
import { useBookings } from "../hooks/useBookings";

type Attendee = {
  name: string;
  email: string;
};

type BookingFormProps = {
  eventId: string;
  eventTitle: string;
};

export default function BookingForm({ eventId, eventTitle }: BookingFormProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([
    { name: "", email: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { createBooking } = useBookings();

  const addAttendee = () => {
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
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // legger inn hver påmelding separat
      const bookingPromises = attendees.map((attendee) =>
        createBooking({
          event_id: eventId,
          name: attendee.name,
          email: attendee.email,
        })
      );

      await Promise.all(bookingPromises);

      setSubmitSuccess(true);
      setAttendees([{ name: "", email: "" }]); // reset skjema
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to submit booking. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="booking-success">
        <h3>Påmelding mottatt!</h3>
        <p>Takk for din påmelding til {eventTitle}.</p>
        <p>
          Du vil motta en bekreftelse på e-post når påmeldingen er behandlet.
        </p>
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
      <h2 className="page-title">Påmeldingsskjema</h2>
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

          <button
            type="button"
            onClick={addAttendee}
            className="add-attendee-btn"
            disabled={isSubmitting}
          >
            Legg til deltaker
          </button>
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Sender..." : "Meld på"}
        </button>
      </form>
    </>
  );
}
