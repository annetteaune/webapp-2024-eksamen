"use client";
import { Event } from "@/features/events/interfaces";
import { useManualBookingForm } from "../hooks/useManualBookingForm";

interface ManualBookingFormProps {
  event: Event;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualBookingForm = ({
  event,
  onClose,
  onSuccess,
}: ManualBookingFormProps) => {
  const { name, setName, email, setEmail, isSubmitting, errors, handleSubmit } =
    useManualBookingForm({ event, onClose, onSuccess });

  return (
    <div className="modal">
      <div className="modal-content booking-modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h3>Legg til ny påmelding</h3>

        <div className="event-info">
          <p>Arrangement: {event.title}</p>
          <p>Dato: {new Date(event.date).toLocaleDateString("no-NO")}</p>
          {event.price > 0 && <p>Pris: {event.price} kr</p>}
        </div>

        {errors.server && <div className="error-message">{errors.server}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Navn:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className={errors.name ? "error" : ""}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">E-post:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className={errors.email ? "error" : ""}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="modal-buttons">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="btn primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Lagrer..." : "Legg til påmelding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
