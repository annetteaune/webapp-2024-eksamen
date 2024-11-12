import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";

type EventCardProps = {
  id: number;
  slug: string;
  title: string;
  type: string;
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

  return (
    <article className="event-card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <span className="card-type">{type}</span>
      </div>

      <div className="card-date-wrapper">
        <span className="card-date">{formattedDate}</span>
        <span className="card-place">{location}</span>
      </div>

      <p className="card-desc">{description}</p>

      <span className="card-status">Status: {status}</span>

      <Link href={`/${slug}`} className="card-btn">
        <button>Les mer</button>
      </Link>
    </article>
  );
}
