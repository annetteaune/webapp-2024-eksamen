"use client";
import { useState } from "react";
import { Event } from "@/features/events/interfaces";
import { fetcher } from "@/api/fetcher";
import {
  validateForm,
  manualBookingSchema,
  type ValidationErrors,
} from "../helpers/validate";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = { name, email };
    const { isValid, errors: validationErrors } = validateForm(
      manualBookingSchema,
      formData
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await fetcher("/bookings", {
        method: "POST",
        body: JSON.stringify({
          event_id: event.id,
          name,
          email,
        }),
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating booking:", error);
      setErrors({
        server: "Kunne ikke opprette påmelding",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
