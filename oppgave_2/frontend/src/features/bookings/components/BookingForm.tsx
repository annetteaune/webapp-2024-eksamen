"use client";
import { useState } from "react";

type Attendee = {
  name: string;
  email: string;
};

type BookingFormProps = {
  eventId: number;
  eventTitle: string;
};

export default function BookingForm({ eventId, eventTitle }: BookingFormProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([
    { name: "", email: "" },
  ]);

  const addAttendee = () => {
    setAttendees([...attendees, { name: "", email: "" }]);
  };

  // claude.ai
  const removeAttendee = (index: number) => {
    if (attendees.length > 1) {
      const newAttendees = attendees.filter((_, i) => i !== index);
      setAttendees(newAttendees);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bookings = attendees.map((attendee) => ({
      event_id: eventId,
      name: attendee.name,
      email: attendee.email,
      has_paid: false,
      status: "På venteliste",
    }));

    console.log(bookings);
  };

  return (
    <>
      <h2 className="page-title">Påmeldingsskjema</h2>
      <form onSubmit={handleSubmit} className="booking-form">
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
                  />
                </label>
              </div>
              {attendees.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAttendee(index)}
                  className="remove-attendee-btn"
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
          >
            Legg til deltaker
          </button>
        </div>

        <button type="submit" className="submit-btn">
          Meld på
        </button>
      </form>
    </>
  );
}
