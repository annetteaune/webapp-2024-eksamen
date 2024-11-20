"use client";
import { Booking } from "@/features/bookings/interfaces";

export const BookingsCard = ({
  booking,
  onManage,
}: {
  booking: Booking;
  onManage: (booking: Booking) => void;
}) => (
  <div className="booking-card">
    <div className="booking-info">
      <h4>{booking.name}</h4>
      <p>{booking.email}</p>
      <p>Status: {booking.status}</p>
    </div>
    <button onClick={() => onManage(booking)} className="btn">
      Administrer
    </button>
  </div>
);
