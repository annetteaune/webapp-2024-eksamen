import { Event } from "@/features/events/interfaces";
import { FaEdit, FaTrash, FaUsers } from "react-icons/fa";

interface EventsListProps {
  events: Event[];
  onDelete: (id: string) => void;
}

export const EventsList = ({ events, onDelete }: EventsListProps) => (
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
              onClick={() => onDelete(event.id)}
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
