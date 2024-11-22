import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";
import { getTypeIcon, getStatusIcon } from "../helpers/getIcons";
import { FaCalendarAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

type EventCardProps = {
  id: string;
  slug: string;
  title: string;
  type: {
    id: string;
    name: string;
  };
  date: string;
  location: string;
  description: string;
  capacity: number;
  status: string;
};

export default function EventCard({
  id,
  slug,
  title,
  type,
  date,
  location,
  description,
  capacity,
  status,
}: EventCardProps) {
  const formattedDate = format(new Date(date), "d. MMMM yyyy", {
    locale: nb,
  });

  const TypeIcon = getTypeIcon(type.name);
  const StatusIcon = getStatusIcon(status);

  return (
    <article className="event-card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <div className="card-type-container">
          {" "}
          <span className="card-type">{type.name}</span>{" "}
          <TypeIcon className="card-icon" />
        </div>
      </div>

      <div className="card-meta">
        <span className="card-date">
          <FaCalendarAlt />
          {formattedDate}
        </span>
        <span className="card-place">
          <FaLocationDot />
          {location}
        </span>
      </div>

      <p className="card-desc">{description}</p>

      <div className="card-status">
        <StatusIcon
          className={`status-icon ${
            status === "Ledige plasser" ? "available" : "booked"
          }`}
        />
        <span> {status}</span>
      </div>

      <Link href={`/${slug}`} className="card-btn">
        <button className="btn primary-btn">Les mer</button>
      </Link>
    </article>
  );
}
