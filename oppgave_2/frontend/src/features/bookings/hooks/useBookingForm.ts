"use client";
import { useState, useEffect } from "react";
import { Event } from "@/features/events/interfaces";
import { Template } from "@/features/admin/interfaces";
import { Booking } from "../interfaces";
import { fetcher } from "@/api/fetcher";
import { useBookings } from "./useBookings";
import { useBookingHandler } from "./useBookingHandler";

type Attendee = {
  name: string;
  email: string;
};

interface UseBookingFormProps {
  event: Event;
  eventSlug: string;
  eventTitle: string;
}

export const useBookingForm = ({
  event,
  eventSlug,
  eventTitle,
}: UseBookingFormProps) => {
  const [attendees, setAttendees] = useState<Attendee[]>([
    { name: "", email: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [template, setTemplate] = useState<Template | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const { createBooking } = useBookings();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templateData, bookingsResponse] = await Promise.all([
          event.templateId
            ? fetcher<Template>(`/templates/${event.templateId}`)
            : Promise.resolve(null),
          fetcher<{ bookings: Booking[] }>(`/bookings/${eventSlug}`),
        ]);

        setTemplate(templateData);
        setBookings(bookingsResponse?.bookings || []);
      } catch (error) {
        console.error("Error fetching template or bookings:", error);
        setBookings([]);
      }
    };
    fetchData();
  }, [event.templateId, eventSlug]);

  const bookingHandler = template
    ? useBookingHandler(event, template, bookings)
    : null;

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

  const handleInputChange = (
    index: number,
    field: keyof Attendee,
    value: string
  ) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
  };
  const resetForm = () => {
    setAttendees([{ name: "", email: "" }]);
    setSubmitSuccess(false);
    setSubmitError(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingHandler) return;
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
          event_id: event.id,
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

  return {
    attendees,
    isSubmitting,
    submitError,
    submitSuccess,
    template,
    bookingHandler,
    addAttendee,
    removeAttendee,
    handleInputChange,
    handleSubmit,
    resetForm,
  };
};
