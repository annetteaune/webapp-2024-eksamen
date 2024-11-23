import { useState, useEffect } from "react";
import { Booking } from "@/features/bookings/interfaces";
import { Event } from "@/features/events/interfaces";
import { fetcher } from "@/api/fetcher";
import { endpoints } from "@/api/urls";

type BookingStatus =
  | "Godkjent"
  | "Til behandling"
  | "På venteliste"
  | "Avslått";

interface UseBookingAdminFormProps {
  booking: Booking;
  onSubmit: (
    bookingId: string,
    status: BookingStatus,
    hasPaid: boolean
  ) => Promise<void>;
  onClose: () => void;
}

export const useBookingAdminForm = ({
  booking,
  onSubmit,
  onClose,
}: UseBookingAdminFormProps) => {
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [hasPaid, setHasPaid] = useState(booking.hasPaid);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await fetcher<Event>(
          endpoints.events.byId(booking.eventId)
        );
        setEvent(eventData);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };
    fetchEvent();
  }, [booking.eventId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(booking.id, status, hasPaid);
      onClose();
    } catch (error) {
      console.error("Error updating booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPaidEvent = event?.price && event.price > 0;

  return {
    status,
    setStatus,
    hasPaid,
    setHasPaid,
    isSubmitting,
    event,
    isPaidEvent,
    handleSubmit,
  };
};
