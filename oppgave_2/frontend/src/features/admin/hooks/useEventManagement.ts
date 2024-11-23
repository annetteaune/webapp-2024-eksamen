import { useState } from "react";
import { fetcher } from "@/api/fetcher";
import { Event } from "@/features/events/interfaces";
import { endpoints } from "@/api/urls";

export const useEventManagement = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (
    eventId: string,
    onDeleteCallback: (id: string) => void
  ) => {
    try {
      const event = await fetcher<Event>(endpoints.events.byId(eventId));
      const bookingsResponse = await fetcher<{ bookings: any[] }>(
        endpoints.bookings.bySlug(event.slug)
      );
      const hasBookings = bookingsResponse.bookings?.length > 0;

      if (hasBookings) {
        setError("Kan ikke slette arrangementer som har påmeldinger.");
        return;
      }
      if (
        window.confirm(
          "Er du sikker på at du vil slette dette arrangementet? Dette kan ikke angres."
        )
      ) {
        onDeleteCallback(eventId);
      }
    } catch (error) {
      setError("Kunne ikke sjekke påmeldingsstatus.");
    }
  };

  // claude.ai
  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setError(null);
  };

  // claude.ai
  const handleUpdate = async (
    data: Omit<Event, "id" | "status" | "waitlist">,
    selectedEvent: Event | null
  ) => {
    try {
      const backendData = {
        slug: data.slug,
        title: data.title,
        description_short: data.descriptionShort,
        description_long: data.descriptionLong,
        date: new Date(data.date).toISOString(),
        location: data.location,
        type_id: data.type.id,
        capacity: Number(data.capacity),
        price: Number(data.price),
        is_private: Boolean(data.isPrivate),
        allow_same_day: Boolean(data.allowSameDay),
        allow_waitlist: Boolean(data.allowWaitlist),
        template_id: data.templateId || null,
        status: selectedEvent?.status,
      };

      if (!selectedEvent?.id) {
        throw new Error("No event selected for update");
      }

      const response = await fetcher(endpoints.events.byId(selectedEvent.id), {
        method: "PATCH",
        body: JSON.stringify(backendData),
        ignoreResponseError: true,
      });

      if (response.error) {
        throw new Error(response.error.message || "Update failed");
      }

      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Kunne ikke oppdatere arrangementet"
      );
      throw error;
    }
  };

  return {
    selectedEvent,
    setSelectedEvent,
    error,
    setError,
    handleDelete,
    handleEdit,
    handleUpdate,
  };
};
