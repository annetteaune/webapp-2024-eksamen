import { useState } from "react";
import { Event } from "@/features/events/interfaces";
import { fetcher } from "@/api/fetcher";
import {
  validateForm,
  manualBookingSchema,
  type ValidationErrors,
} from "../helpers/validate";
import { endpoints } from "@/api/urls";

interface UseManualBookingFormProps {
  event: Event;
  onClose: () => void;
  onSuccess: () => void;
}

export const useManualBookingForm = ({
  event,
  onClose,
  onSuccess,
}: UseManualBookingFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = { name, email };
    const { isValid, errors: validationErrors } = validateForm(
      manualBookingSchema,
      formData
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await fetcher(endpoints.bookings.base, {
        method: "POST",
        body: JSON.stringify({
          event_id: event.id,
          name,
          email,
        }),
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating booking:", error);
      setErrors({
        server: "Kunne ikke opprette påmelding",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    isSubmitting,
    errors,
    handleSubmit,
  };
};
