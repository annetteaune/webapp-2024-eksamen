import EventCard from "./EventCard";
import dummyData from "../../../dummydata.json";

export default function EventList() {
  return (
    <section className="event-list">
      {dummyData.events.map((event) => (
        <EventCard
          key={event.id}
          id={event.id}
          slug={event.slug}
          title={event.title}
          type={event.type}
          date={event.date}
          location={event.location}
          description={event.description_short}
          capacity={event.capacity}
          status={event.status}
        />
      ))}
    </section>
  );
}
