import { useState, useEffect } from "react";
import { Event } from "@/features/events/interfaces";
import { Template } from "@/features/admin/interfaces";
import { Booking } from "@/features/bookings/interfaces";
import { fetcher } from "@/api/fetcher";
import { useBookings } from "./useBookings";
import { useBookingHandler } from "./useBookingHandler";

type Attendee = {
  name: string;
  email: string;
};

type UseBookingFormProps = {
  eventId: string;
  eventSlug: string;
};

export const useBookingForm = ({ eventId, eventSlug }: UseBookingFormProps) => {
  const [attendees, setAttendees] = useState<Attendee[]>([
    { name: "", email: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const createDefaultTemplate = (): Template => ({
    id: "default",
    name: "Default Template",
    allowedDays: [],
    maxCapacity: event?.capacity || 0,
    price: event?.price || 0,
    isPrivate: event?.isPrivate || false,
    allowWaitlist: event?.allowWaitlist || false,
    allowSameDay: event?.allowSameDay || true,
    fixedPrice: false,
    createdAt: new Date().toISOString(),
    typeId: event?.type.id || "",
  });

  const { createBooking } = useBookings();
  const bookingHandler = event
    ? useBookingHandler(event, template || createDefaultTemplate(), bookings)
    : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await fetcher<Event>(`/events/${eventSlug}`);
        if (!eventData) {
          throw new Error("Event not found");
        }
        setEvent(eventData);

        try {
          const [templateData, bookingsResponse] = await Promise.all([
            eventData.templateId
              ? fetcher<Template>(`/templates/${eventData.templateId}`)
              : Promise.resolve(null),
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
      }
    };
    fetchData();
  }, [eventSlug]);

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

  //claude.ai
  const updateAttendee = (
    index: number,
    field: keyof Attendee,
    value: string
  ) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
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
      setTimeout(() => {
        window.location.reload();
      }, 3500);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Feil ved påmelding"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    attendees,
    isSubmitting,
    submitError,
    submitSuccess,
    event,
    template,
    bookingHandler,
    addAttendee,
    removeAttendee,
    updateAttendee,
    handleSubmit,
  };
};
