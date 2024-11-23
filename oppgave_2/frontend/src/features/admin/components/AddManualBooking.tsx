"use client";
import { FaPlus } from "react-icons/fa";

interface AddManualBookingProps {
  onAdd: () => void;
}

export default function AddManualBooking({ onAdd }: AddManualBookingProps) {
  return (
    <button className="btn primary-btn" onClick={onAdd}>
      <FaPlus />
      Legg til påmelding
    </button>
  );
}
