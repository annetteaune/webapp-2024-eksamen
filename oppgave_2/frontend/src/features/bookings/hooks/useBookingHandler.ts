import { Event } from "@/features/events/interfaces";
import {
  Booking,
  bookingDataSchema,
  BookingStatus,
  CreateBookingData,
} from "../interfaces";
import { z } from "zod";
import { Template } from "@/features/admin/interfaces";

// har fått hjelp av claude.ai til store deler av denne hooken
export const useBookingHandler = (
  event: Event,
  template: Template,
  existingBookings: Booking[] = []
) => {
  const getBookingsCount = () =>
    Array.isArray(existingBookings)
      ? existingBookings.filter(
          (booking) =>
            booking.status === "Godkjent" || booking.status === "Til behandling"
        ).length
      : 0;

  const getWaitlistCount = () =>
    Array.isArray(existingBookings)
      ? existingBookings.filter((booking) => booking.status === "På venteliste")
          .length
      : 0;
  const getApprovedBookingsCount = () =>
    existingBookings.filter((booking) => booking.status === "Godkjent").length;

  const getAvailableSpots = () =>
    Math.max(0, event.capacity - getApprovedBookingsCount());

  const calculateTotalPrice = (attendeeCount: number) =>
    event.price * attendeeCount;

  const getBookingStatus = (requestedSpots: number): BookingStatus => {
    const availableSpots = getAvailableSpots();
    const isFull = getApprovedBookingsCount() >= event.capacity;

    if (!isFull) {
      if (requestedSpots <= availableSpots) {
        return {
          canBook: true,
          availableSpots,
          mustUseWaitlist: false,
          message:
            event.price > 0
              ? `Total pris: ${calculateTotalPrice(requestedSpots)} kr`
              : "Gratis arrangement",
          totalPrice: calculateTotalPrice(requestedSpots),
        };
      }
      return {
        canBook: false,
        availableSpots,
        mustUseWaitlist: false,
        message: `Kun ${availableSpots} plasser tilgjengelig`,
        totalPrice: 0,
      };
    }

    if (template.allowWaitlist) {
      return {
        canBook: true,
        availableSpots: 0,
        mustUseWaitlist: true,
        message: "Arrangementet er fullt - registrering til venteliste",
        totalPrice: calculateTotalPrice(requestedSpots),
      };
    }

    return {
      canBook: false,
      availableSpots: 0,
      mustUseWaitlist: false,
      message: "Det er ingen ledige plasser igjen.",
      totalPrice: 0,
    };
  };

  const validateBooking = async (
    data: CreateBookingData
  ): Promise<
    | { success: true; data: CreateBookingData }
    | { success: false; error: string }
  > => {
    try {
      const validated = bookingDataSchema.parse(data);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors[0].message,
        };
      }
      return {
        success: false,
        error: "Ugyldig data",
      };
    }
  };

  return {
    getBookingStatus,
    validateBooking,
    getAvailableSpots,
    calculateTotalPrice,
    getBookingsCount,
    getWaitlistCount,
  };
};
