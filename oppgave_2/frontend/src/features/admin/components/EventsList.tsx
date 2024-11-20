import { Event } from "@/features/events/interfaces";
import { FaEdit, FaTrash, FaUsers, FaRegEyeSlash } from "react-icons/fa";
import { useState } from "react";
import EventForm from "./EventForm";
import { fetcher } from "@/api/fetcher";

interface EventsListProps {
  events: Event[];
  onDelete: (id: string) => void;
}

export const EventsList = ({ events, onDelete }: EventsListProps) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = (eventId: string) => {
    if (
      window.confirm(
        "Er du sikker på at du vil slette arrangementet? Dette kan ikke angres."
      )
    ) {
      onDelete(eventId);
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setError(null);
  };

  const handleUpdate = async (
    data: Omit<Event, "id" | "status" | "waitlist">
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

      console.log("Sending data to backend:", backendData);

      const response = await fetcher(`/events/${selectedEvent?.id}`, {
        method: "PATCH",
        body: JSON.stringify(backendData),
        ignoreResponseError: true, // Add this to get the error response
      });

      console.log("Backend response:", response);

      if (response.error) {
        throw new Error(response.error.message || "Update failed");
      }

      window.location.reload();
    } catch (error) {
      console.error("Detailed error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Kunne ikke oppdatere arrangementet"
      );
      throw error;
    }
  };

  return (
    <div className="events-section">
      <h3>Arrangementer</h3>
      {error && (
        <div
          className="error-message"
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fee2e2",
            color: "black",
            padding: "1rem",
            borderRadius: "6px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
          }}
        >
          {error}
        </div>
      )}
      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className="a-event-card">
            <div className="event-info">
              <h4>{event.title}</h4>
              <p>{new Date(event.date).toLocaleDateString("no-NO")}</p>
              <p>
                Kapasitet: {event.capacity} | Status: {event.status}
              </p>
              <p>Type: {event.type.name}</p>
              {event.isPrivate && (
                <span className="private-badge">
                  <FaRegEyeSlash /> Privat arrangement
                </span>
              )}
            </div>
            <div className="event-actions">
              <button
                className="icon-btn edit"
                onClick={() => handleEdit(event)}
              >
                <FaEdit />
              </button>
              <button
                className="icon-btn users"
                onClick={() =>
                  (window.location.href = `/admin/${event.slug}/bookings`)
                }
              >
                <FaUsers />
              </button>
              <button
                className="icon-btn delete"
                onClick={() => handleDelete(event.id)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <EventForm
          onClose={() => setSelectedEvent(null)}
          onSubmit={handleUpdate}
          initialData={selectedEvent}
        />
      )}
    </div>
  );
};
