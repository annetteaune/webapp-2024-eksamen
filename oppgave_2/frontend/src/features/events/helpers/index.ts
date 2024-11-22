import { fetcher } from "@/api/fetcher";
import { Booking } from "@/features/bookings/interfaces";
import { BookingCounts } from "../interfaces";
import { Template } from "@/features/admin/interfaces";

export async function getBookingCounts(slug: string): Promise<BookingCounts> {
  try {
    const response = await fetcher<{ bookings: Booking[] }>(
      `/bookings/${slug}`
    );

    if (!response || !response.bookings) {
      throw new Error("No bookings data received");
    }

    const bookings = response.bookings;

    return {
      approved: bookings.filter((booking) => booking.status === "Godkjent")
        .length,
      pending: bookings.filter((booking) => booking.status === "Til behandling")
        .length,
      waitlist: bookings.filter((booking) => booking.status === "På venteliste")
        .length,
      total: bookings.filter(
        (booking) =>
          booking.status === "Godkjent" || booking.status === "Til behandling"
      ).length,
    };
  } catch (error) {
    console.error("Error fetching bookings count:", error);
    return {
      approved: 0,
      pending: 0,
      waitlist: 0,
      total: 0,
    };
  }
}

export async function getTemplateDetails(
  templateId: string
): Promise<Template | null> {
  try {
    const template = await fetcher<Template>(`/templates/${templateId}`);
    return template;
  } catch (error) {
    console.error("Error fetching template:", error);
    return null;
  }
}
