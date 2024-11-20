import { useState, useEffect } from "react";
import { Event } from "@/features/events/interfaces";
import { EventFormFields, Template, Type } from "../interfaces";
import { fetcher } from "@/api/fetcher";
import {
  eventFormSchema,
  type ValidationErrors,
  validateField,
  validateForm,
  formatDateForInput,
} from "../helpers/validate";
import { generateUniqueSlug } from "@/features/events/helpers/generateUniqueSlug";

interface UseEventFormProps {
  onSubmit: (data: Omit<Event, "id" | "status" | "waitlist">) => Promise<void>;
  onClose: () => void;
  initialData?: Event;
}

export const useEventForm = ({
  onSubmit,
  onClose,
  initialData,
}: UseEventFormProps) => {
  const [formData, setFormData] = useState<EventFormFields>({
    slug: initialData?.slug ?? "",
    title: initialData?.title ?? "",
    descriptionShort: initialData?.descriptionShort ?? "",
    descriptionLong: initialData?.descriptionLong ?? "",
    date: initialData?.date ? formatDateForInput(initialData.date) : "",
    location: initialData?.location ?? "",
    typeId: initialData?.type.id ?? "",
    capacity: initialData?.capacity ?? 0,
    price: initialData?.price ?? 0,
    templateId: initialData?.templateId,
    allowWaitlist: false,
    isPrivate: initialData?.isPrivate ?? false,
    allowSameDay: initialData?.allowSameDay ?? true,
  });

  // claude.ai - hele resten av koden i større eller mindre grad

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [types, setTypes] = useState<Type[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [existingEvents, setExistingEvents] = useState<Event[]>([]);
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(today.getFullYear() + 2);

    setMinDate(today.toISOString().split("T")[0]);
    setMaxDate(twoYearsFromNow.toISOString().split("T")[0]);

    const fetchData = async () => {
      try {
        const [typesResponse, templatesResponse, eventsResponse] =
          await Promise.all([
            fetcher<TypesResponse>("/types"),
            fetcher<{ templates: Template[] }>("/templates"),
            fetcher<{ events: Event[] }>("/events?includePrivate=true"),
          ]);
        setTypes(typesResponse.types);
        setTemplates(templatesResponse.templates);
        setExistingEvents(
          eventsResponse.events.filter((e) => e.id !== initialData?.id)
        );
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };
    fetchData();
  }, [initialData?.id]);

  const isAllowedDay = (date: string, allowedDays: string[]): boolean => {
    if (!date || !allowedDays?.length) return true;

    const dayNames = [
      "Søndag",
      "Mandag",
      "Tirsdag",
      "Onsdag",
      "Torsdag",
      "Fredag",
      "Lørdag",
    ];

    const selectedDate = new Date(date);
    const dayName = dayNames[selectedDate.getDay()];
    return allowedDays.includes(dayName);
  };

  const checkDateConflicts = (selectedDate: string): boolean => {
    if (!selectedDate) return false;

    const dateToCheck = new Date(selectedDate).toISOString().split("T")[0];
    const conflictingEvent = existingEvents.find((event) => {
      const eventDate = new Date(event.date).toISOString().split("T")[0];
      return eventDate === dateToCheck && !event.allowSameDay;
    });

    return !!conflictingEvent;
  };

  const handleDateChange = async (value: string) => {
    setErrors((prev) => ({ ...prev, date: "" }));

    if (!value) {
      handleInputChange("date", "");
      return;
    }

    const selectedTemplate = templates.find(
      (t) => t.id === formData.templateId
    );

    if (
      selectedTemplate &&
      !isAllowedDay(value, selectedTemplate.allowedDays)
    ) {
      setErrors((prev) => ({
        ...prev,
        date: `Velg en tillatt dag: ${selectedTemplate.allowedDays.join(", ")}`,
      }));
      return;
    }

    const hasConflict = checkDateConflicts(value);
    if (hasConflict && (!formData.allowSameDay || !initialData?.allowSameDay)) {
      setErrors((prev) => ({
        ...prev,
        date: "Det finnes allerede et arrangement på denne datoen som ikke tillater andre arrangementer samme dag",
      }));
      return;
    }

    handleInputChange("date", value);
  };

  const handleAllowSameDayChange = (checked: boolean) => {
    handleInputChange("allowSameDay", checked);

    if (!checked && formData.date) {
      const hasConflict = checkDateConflicts(formData.date);
      if (hasConflict) {
        setErrors((prev) => ({
          ...prev,
          date: "Det finnes allerede et arrangement på denne datoen som ikke tillater andre arrangementer samme dag",
        }));
      }
    }
  };

  const handleInputChange = (
    field: keyof EventFormFields,
    value: string | number | boolean
  ) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    if (typeof value === "boolean") {
      return;
    }

    const fieldSchema =
      eventFormSchema.shape[field as keyof typeof eventFormSchema.shape];
    if (fieldSchema) {
      const newErrors = validateField(eventFormSchema, field, value, newData);
      setErrors((prev) => ({ ...prev, ...newErrors }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      setIsSubmitting(true);

      const slug = await generateUniqueSlug(formData.title, formData.date);

      if (!formData.allowSameDay && formData.date) {
        const selectedDate = new Date(formData.date)
          .toISOString()
          .split("T")[0];
        const response = await fetcher<{ events: Event[] }>("/events");
        const events = response.events.filter((e) => e.id !== initialData?.id);

        const hasConflict = events.some((event) => {
          const eventDate = new Date(event.date).toISOString().split("T")[0];
          return eventDate === selectedDate && !event.allowSameDay;
        });

        if (hasConflict) {
          setErrors({
            date: "Det finnes allerede et arrangement på denne datoen som ikke tillater andre arrangementer samme dag",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const { templateId, ...requiredFields } = formData;
      const finalSubmissionData = templateId
        ? { ...requiredFields, templateId, slug }
        : { ...requiredFields, slug };

      const submitSchema = templateId
        ? eventFormSchema
        : eventFormSchema.omit({ templateId: true });
      const { isValid, errors: validationErrors } = validateForm(
        submitSchema,
        finalSubmissionData
      );

      if (!isValid) {
        setErrors(validationErrors);
        return;
      }

      const submitData = {
        ...finalSubmissionData,
        type: {
          id: finalSubmissionData.typeId,
          name:
            types.find((t) => t.id === finalSubmissionData.typeId)?.name ?? "",
        },
      };

      await onSubmit(submitData as Omit<Event, "id" | "status" | "waitlist">);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors({ _form: "Det oppstod en feil ved lagring av arrangementet" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = async (templateId: string) => {
    if (!templateId) {
      setFormData((prev) => ({
        ...prev,
        templateId: undefined,
        capacity: 0,
        price: 0,
        allowWaitlist: false,
        isPrivate: false,
        allowSameDay: true,
        typeId: "",
      }));
      setErrors((prev) => ({ ...prev, date: "" }));
      return;
    }

    try {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setFormData((prev) => ({
          ...prev,
          templateId,
          capacity: template.maxCapacity,
          price: template.price,
          allowWaitlist: template.allowWaitlist,
          isPrivate: template.isPrivate,
          allowSameDay: template.allowSameDay,
          typeId: template.typeId,
          date: isAllowedDay(prev.date, template.allowedDays) ? prev.date : "",
        }));
        if (
          formData.date &&
          isAllowedDay(formData.date, template.allowedDays)
        ) {
          setErrors((prev) => ({ ...prev, date: "" }));
        }
      }
    } catch (error) {
      console.error("Error applying template:", error);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    types,
    templates,
    minDate,
    maxDate,
    handleDateChange,
    handleAllowSameDayChange,
    handleInputChange,
    handleSubmit,
    applyTemplate,
  };
};
