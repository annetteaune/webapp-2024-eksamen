export default function Home() {
  return (
    <>
      <h2>Alle arrangementer</h2>
      <EventList />
    </>
  );
}
import EventList from "@/features/events/components/EventList";
import React from "react";
