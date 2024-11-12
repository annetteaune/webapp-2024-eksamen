import EventList from "@/features/events/components/EventList";

export default function Admin() {
  return (
    <>
      <h2>Admin Dashboard</h2>
      <button>Opprett nytt arrangement</button>
      <EventList />
    </>
  );
}
