import { Event } from "@/features/events/interfaces";
import { FaEdit, FaTrash, FaUsers, FaRegEyeSlash } from "react-icons/fa";

interface EventsListProps {
  events: Event[];
  onDelete: (id: string) => void;
}

export const EventsList = ({ events, onDelete }: EventsListProps) => {
  const handleDelete = (eventId: string) => {
    if (
      window.confirm(
        "Er du sikker på at du vil slette arrangementet? Dette kan ikke angres."
      )
    ) {
      onDelete(eventId);
    }
  };

  return (
    <div className="events-section">
      <h3>Arrangementer</h3>
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
              <button className="icon-btn edit">
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
    </div>
  );
};
