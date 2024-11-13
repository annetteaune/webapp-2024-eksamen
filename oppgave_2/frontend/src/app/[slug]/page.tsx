import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookingForm from "@/features/bookings/components/BookingForm";
import { getEvent } from "@/features/events/hooks/useEvent";

export default async function EventPage({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const event = await getEvent(params.slug);

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
            <p>{event.type.name}</p>
            <p>{formattedDate}</p>
            <p>{event.location}</p>
          </div>
        </div>

        <div className="event-description">
          <h3>Om arrangementet</h3>
          <p>{event.descriptionLong}</p>
        </div>

        <div className="event-info">
          <h3>Praktisk informasjon</h3>
          <p>Status: {event.status}</p>
          <p>Antall påmeldte: *legg til en count av antall bookinger*</p>
          <p>Kapasitet: {event.capacity} personer</p>
          <p>Pris: {event.price} kr</p>
        </div>

        <section>
          <BookingForm eventId={event.id} eventTitle={event.title} />
        </section>
      </article>
    );
  } catch (error) {
    return (
      <div className="error-container">
        <h2>Noe gikk galt</h2>
        <p>Kunne ikke laste arrangementet. Vennligst prøv igjen senere.</p>
        <Link href="/">Tilbake til forsiden</Link>
      </div>
    );
  }
}
