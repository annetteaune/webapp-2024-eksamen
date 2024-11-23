import React, { useState } from "react";
import { fetcher } from "@/api/fetcher";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Event } from "@/features/events/interfaces";
import { Booking } from "@/features/bookings/interfaces";

interface FormattedBooking {
  Navn: string;
  "E-post": string;
  Arrangement: string;
  Dato: string;
  Status: string;
  Betalt: string;
}

// claude.ai har hjulpet meg å sette opp hele komponenten
const ExportBookings = () => {
  const [selectedYear, setSelectedYear] = useState(2024);

  const [error, setError] = useState("");

  // velger å benytte de samme årene som er tilgjengelig å sortere på
  const years = [2024, 2025, 2026];

  const formatBookingData = (
    bookings: Booking[],
    events: Event[]
  ): FormattedBooking[] => {
    return bookings.map((booking) => {
      const event = events.find((e) => e.id === booking.eventId);
      return {
        Navn: booking.name,
        "E-post": booking.email,
        Arrangement: event?.title || "Ukjent arrangement",
        Dato: event
          ? format(new Date(event.date), "d. MMMM yyyy", { locale: nb })
          : "Ukjent dato",
        Status: booking.status,
        Betalt:
          event && event.price
            ? booking.hasPaid
              ? "Ja"
              : "Nei"
            : "Gratis arrangement",
      };
    });
  };

  const handleExport = async () => {
    try {
      setError("");

      const [bookingsResponse, eventsResponse] = await Promise.all([
        fetcher<{ bookings: Booking[] }>("/bookings"),
        fetcher<{ events: Event[] }>("/events"),
      ]);

      const allBookings = bookingsResponse.bookings;
      const allEvents = eventsResponse.events;

      const yearEvents = allEvents.filter(
        (event) => new Date(event.date).getFullYear() === selectedYear
      );

      const yearEventIds = yearEvents.map((event) => event.id);
      const yearBookings = allBookings.filter((booking) =>
        yearEventIds.includes(booking.eventId)
      );

      const formattedData = formatBookingData(yearBookings, yearEvents);

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        `Påmeldinger ${selectedYear}`
      );

      XLSX.writeFile(workbook, `påmeldinger-${selectedYear}.xlsx`);
    } catch (error) {
      console.error("Export error:", error);
      setError("Kunne ikke eksportere data.");
    }
  };

  return (
    <div className="export-container">
      <h3>Alle påmeldinger</h3>
      <p>Last ned .xlsx-fil med informasjon om alle påmeldinger per år.</p>

      <div className="export-controls">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="year-select"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <button onClick={handleExport} className="btn primary-btn">
          Last ned
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ExportBookings;
