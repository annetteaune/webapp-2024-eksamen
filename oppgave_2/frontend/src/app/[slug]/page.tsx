import { format } from "date-fns";
import { nb } from "date-fns/locale";
import dummyData from "../../dummydata.json";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookingForm from "@/features/bookings/components/BookingForm";

export default function EventPage({ params }: { params: { slug: string } }) {
  const event = dummyData.events.find((event) => event.slug === params.slug);

  if (!event) {
    notFound();
  }

  const formattedDate = format(
    new Date(event.date),
    "d. MMMM yyyy 'kl.' HH:mm",
    {
      locale: nb,
    }
  );

  return (
    <article className="event-page">
      <Link href="/" className="back-link">
        {"<"} Tilbake til arrangementer
      </Link>

      <div className="event-header">
        <h2 className="event-title">{event.title}</h2>
        <div className="event-meta">
          <p>{event.type}</p>
          <p>{formattedDate}</p>
          <p>{event.location}</p>
        </div>
      </div>

      <div className="event-description">
        <h3>Om arrangementet</h3>
        <p>{event.description_long}</p>
      </div>

      <div className="event-info">
        <h3>Praktisk informasjon</h3>
        <p>Status: {event.status}</p>
        <p>Kapasitet: {event.capacity} personer</p>
        <p>Pris: {event.price} kr</p>
      </div>

      <section>
        <BookingForm eventId={event.id} eventTitle={event.title} />
      </section>
    </article>
  );
}
