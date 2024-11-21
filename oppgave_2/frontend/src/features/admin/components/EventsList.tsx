import { Event } from "@/features/events/interfaces";
import { FaEdit, FaTrash, FaRegEyeSlash } from "react-icons/fa";
import EventForm from "./EventForm";
import { useEventManagement } from "../hooks/useEventManagement";
import ErrorMessage from "@/components/ErrorMessage";

interface EventsListProps {
  events: Event[];
  onDelete: (id: string) => void;
}

export const EventsList = ({ events, onDelete }: EventsListProps) => {
  const {
    selectedEvent,
    setSelectedEvent,
    error,
    setError,
    handleEdit,
    handleDelete,
    handleUpdate,
  } = useEventManagement();

  return (
    <div className="events-section">
      <h3>Arrangementer</h3>
      <ErrorMessage message={error} onDismiss={() => setError(null)} />

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
                <span className="tooltip">Rediger arrangement</span>
              </button>

              <button
                className="icon-btn delete"
                onClick={() => handleDelete(event.id, onDelete)}
              >
                <FaTrash />
                <span className="tooltip">Slett arrangement</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <EventForm
          onClose={() => setSelectedEvent(null)}
          onSubmit={(data) => handleUpdate(data, selectedEvent)}
          initialData={selectedEvent}
        />
      )}
    </div>
  );
};
