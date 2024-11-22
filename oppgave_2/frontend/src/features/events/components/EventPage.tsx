import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookingForm from "@/features/bookings/components/BookingForm";
import { getEvent } from "@/features/events/hooks/useEvent";
import { getBookingCounts, getTemplateDetails } from "../helpers";
import { FaRegEyeSlash, FaExclamationCircle } from "react-icons/fa";
import { getTypeIcon } from "../helpers/getIcons";
import { FaCalendarAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

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
    const showWaitlistInfo =
      (template?.allowWaitlist || event.allowWaitlist) && isEventFull;
    const TypeIcon = getTypeIcon(event.type.name);

    return (
      <article className="event-page">
        <Link href="/" className="back-link">
          {"<"} Tilbake til arrangementer
        </Link>

        <div className="event-header">
          <h2 className="page-title">{event.title}</h2>
          <div className="event-meta">
            <p>
              {" "}
              <TypeIcon />
              {event.type.name}
            </p>
            <p>
              <FaCalendarAlt />
              {formattedDate}
            </p>
            <p>
              {" "}
              <FaLocationDot />
              {event.location}
            </p>
          </div>
        </div>

        <div className="event-description">
          <h3>Om arrangementet</h3>
          <p>{event.descriptionLong}</p>
        </div>

        <div className="event-info">
          <div className="info-container">
            <p>
              <span className="bold">Status</span>: {event.status}
            </p>

            {event.price > 0 ? (
              <>
                <p>
                  <span className="bold">Godkjente påmeldinger</span>:{" "}
                  {bookingCounts.approved}
                </p>
                <p>
                  <span className="bold">Påmeldinger til behandling</span>:{" "}
                  {bookingCounts.pending}
                </p>
                <p>
                  <span className="bold">Totalt antall påmeldte</span>:{" "}
                  {bookingCounts.total}
                </p>
              </>
            ) : (
              <p>
                <span className="bold">Påmeldinger</span>:{" "}
                {bookingCounts.approved}
              </p>
            )}

            {bookingCounts.waitlist > 0 && (
              <p>
                <span className="bold">På venteliste</span>:{" "}
                {bookingCounts.waitlist}
              </p>
            )}

            <p>
              <span className="bold">Kapasitet</span>: {event.capacity} personer
            </p>
            <p>
              {event.price === 0 ? (
                "GRATIS"
              ) : (
                <>
                  <span className="bold">Pris: </span>
                  {event.price} kr
                </>
              )}
            </p>
          </div>
          <div className="notice-container">
            {event.price > 0 && !isEventFull && (
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
                ventelisten få tilbud om plass i den rekkefølgen de meldte seg
                på.
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
        <p>Kunne ikke inn laste arrangementet.</p>
        <Link href="/">Tilbake til forsiden</Link>
      </div>
    );
  }
}
