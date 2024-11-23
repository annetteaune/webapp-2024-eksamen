import EventPage from "@/features/events/components/EventPage";

interface SingleEventProps {
  params: {
    slug: string;
  };
}

export default function SingleEvent({ params }: SingleEventProps) {
  return <EventPage slug={params.slug} />;
}
