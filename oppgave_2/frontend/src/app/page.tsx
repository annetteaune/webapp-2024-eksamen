import EventList from "@/features/events/components/EventList";
import Filter from "@/features/events/components/Filter";
import React from "react";

export default function Home() {
  return (
    <>
      <Filter />
      <EventList />
    </>
  );
}
