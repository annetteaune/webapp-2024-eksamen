import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookingForm from "@/features/bookings/components/BookingForm";
import { getEvent } from "@/features/events/hooks/useEvent";
import { getBookingCounts, getTemplateDetails } from "../helpers";
import { FaRegEyeSlash, FaExclamationCircle } from "react-icons/fa";

interface EventPageProps {
  slug: string;
}

export default async function EventPage({ slug }: EventPageProps) {
  try {
    const event = await getEvent(slug);

    if (!event) {
      notFound();
    }

    const [bookingCounts, template] = await Promise.all([
      getBookingCounts(slug),
      getTemplateDetails(event.templateId),
    ]);

    const formattedDate = format(
      new Date(event.date),
      "d. MMMM yyyy 'kl.' HH:mm",
      {
        locale: nb,
      }
    );

    const isEventFull = bookingCounts.total >= event.capacity;
    const showWaitlistInfo = template?.allowWaitlist && isEventFull;

    return (
      <article className="event-page">
        <Link href="/" className="back-link">
          {"<"} Tilbake til arrangementer
        </Link>

        <div className="event-header">
          <h2 className="page-title">{event.title}</h2>
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

          {event.price > 0 ? (
            <>
              <p>Godkjente påmeldinger: {bookingCounts.approved}</p>
              <p>Påmeldinger til behandling: {bookingCounts.pending}</p>
              <p>Totalt antall påmeldte: {bookingCounts.total}</p>
            </>
          ) : (
            <p>Påmeldinger: {bookingCounts.approved}</p>
          )}

          {bookingCounts.waitlist > 0 && (
            <p>På venteliste: {bookingCounts.waitlist}</p>
          )}

          <p>Kapasitet: {event.capacity} personer</p>
          <p> {event.price === 0 ? "GRATIS" : `Pris: ${event.price} kr`}</p>

          {event.price > 0 && (
            <p className="payment-info">
              <FaExclamationCircle />
              Påmeldingen din godkjennes av en administrator etter betaling er
              mottatt.
            </p>
          )}

          {showWaitlistInfo && (
            <p className="waitlist-info">
              <FaExclamationCircle />
              Dette arrangementet har venteliste. Ved avbestillinger vil de på
              ventelisten få tilbud om plass i den rekkefølgen de meldte seg på.
            </p>
          )}

          {event.isPrivate && (
            <p className="waitlist-info">
              <FaRegEyeSlash />
              Dette arrangementet er privat, og er kun tilgjengelig for de med
              direkte tilgang til linken.
            </p>
          )}
        </div>

        <section>
          <BookingForm
            eventId={event.id}
            eventTitle={event.title}
            eventSlug={slug}
          />
        </section>
      </article>
    );
  } catch (error) {
    return (
      <div className="not-found">
        <h2>Noe gikk galt</h2>
        <p>Kunne ikke laste arrangementet. Vennligst prøv igjen senere.</p>
        <Link href="/">Tilbake til forsiden</Link>
      </div>
    );
  }
}
