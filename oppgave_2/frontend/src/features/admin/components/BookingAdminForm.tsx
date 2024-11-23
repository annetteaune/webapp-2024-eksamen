"use client";
import { Booking } from "@/features/bookings/interfaces";
import { useBookingAdminForm } from "../hooks/useBookingAdminForm";

type BookingStatus =
  | "Godkjent"
  | "Til behandling"
  | "På venteliste"
  | "Avslått";

interface BookingAdminFormProps {
  booking: Booking;
  onClose: () => void;
  onSubmit: (
    bookingId: string,
    status: BookingStatus,
    hasPaid: boolean
  ) => Promise<void>;
}

export const BookingAdminForm = ({
  booking,
  onClose,
  onSubmit,
}: BookingAdminFormProps) => {
  const {
    status,
    setStatus,
    hasPaid,
    setHasPaid,
    isSubmitting,
    event,
    isPaidEvent,
    handleSubmit,
  } = useBookingAdminForm({ booking, onSubmit, onClose });

  return (
    <div className="modal">
      <div className="modal-content booking-modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h3>Administrer påmelding</h3>
        <div className="booking-details">
          <p>Navn: {booking.name}</p>
          <p>E-post: {booking.email}</p>
          <p>Status: {booking.status}</p>
          <p>Betalingsstatus: {booking.hasPaid ? "Betalt" : "Ikke betalt"}</p>
        </div>

        <div className="status-options">
          <label>
            <input
              type="radio"
              name="status"
              value="Godkjent"
              checked={status === "Godkjent"}
              onChange={() => setStatus("Godkjent")}
            />
            Godkjenn
          </label>
          <label>
            <input
              type="radio"
              name="status"
              value="Avslått"
              checked={status === "Avslått"}
              onChange={() => setStatus("Avslått")}
            />
            Avslå
          </label>
          <label>
            <input
              type="radio"
              name="status"
              value="Til behandling"
              checked={status === "Til behandling"}
              onChange={() => setStatus("Til behandling")}
            />
            Slett påmelding
          </label>
        </div>

        <div className="payment-options">
          {isPaidEvent ? (
            <>
              {status !== "Til behandling" && (
                <label className="payment-status">
                  <input
                    type="checkbox"
                    checked={hasPaid}
                    onChange={(e) => setHasPaid(e.target.checked)}
                  />
                  Marker som betalt
                </label>
              )}
              <p className="price-info">
                {status === "Til behandling" ? (
                  <>Betaling utgår ved sletting av påmelding</>
                ) : (
                  <>Pris: {event?.price} kr</>
                )}
              </p>
            </>
          ) : (
            <p className="free-event">Gratis arrangement</p>
          )}
        </div>

        <div className="modal-buttons">
          <button className="btn" onClick={onClose} disabled={isSubmitting}>
            Avbryt
          </button>
          <button
            className="btn primary-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Lagrer..."
              : status === "Til behandling"
              ? "Slett"
              : "Lagre endringer"}
          </button>
        </div>
      </div>
    </div>
  );
};
