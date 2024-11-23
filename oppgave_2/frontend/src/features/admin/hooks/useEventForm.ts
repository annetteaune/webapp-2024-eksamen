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
import { endpoints } from "@/api/urls";

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
  const [canTogglePrivate, setCanTogglePrivate] = useState(true);
  const [canToggleWaitlist, setCanToggleWaitlist] = useState(true);

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
            fetcher<TypesResponse>(endpoints.types.base),
            fetcher<{ templates: Template[] }>(endpoints.templates.base),
            fetcher<{ events: Event[] }>(
              endpoints.events.filtered({ includePrivate: "true" })
            ),
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
    let hasConflict = false;

    const existingEventOnDate = existingEvents.find((event) => {
      if (event.id === initialData?.id) return false;
      const eventDate = new Date(event.date).toISOString().split("T")[0];
      return eventDate === dateToCheck && !event.allowSameDay;
    });

    if (existingEventOnDate) {
      hasConflict = true;
    }

    if (!formData.allowSameDay) {
      const anyEventOnDate = existingEvents.find((event) => {
        if (event.id === initialData?.id) return false;
        const eventDate = new Date(event.date).toISOString().split("T")[0];
        return eventDate === dateToCheck;
      });

      if (anyEventOnDate) {
        hasConflict = true;
      }
    }

    return hasConflict;
  };

  const handleDateChange = async (value: string) => {
    setErrors((prev) => ({ ...prev, date: undefined }));

    if (!value) {
      handleInputChange("date", "");
      setErrors((prev) => ({ ...prev, date: "Dato er påkrevd" }));
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
        date: `Malen tillater kun følgende dager: ${selectedTemplate.allowedDays.join(
          ", "
        )}`,
      }));
      return;
    }

    const hasConflict = checkDateConflicts(value);
    if (hasConflict) {
      setErrors((prev) => ({
        ...prev,
        date: "Denne datoen er utilgjengelig",
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
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    const fieldSchema =
      eventFormSchema.shape[field as keyof typeof eventFormSchema.shape];
    if (fieldSchema) {
      try {
        const validationResult = validateField(
          eventFormSchema,
          field,
          value,
          newData
        );
        if (Object.keys(validationResult).length > 0) {
          setErrors((prev) => ({ ...prev, ...validationResult }));
        }
      } catch (error) {
        console.error(`Validation error for field ${field}:`, error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      setIsSubmitting(true);

      if (!formData.date) {
        setErrors({ date: "Dato er påkrevd" });
        setIsSubmitting(false);
        return;
      }

      const hasConflict = checkDateConflicts(formData.date);
      if (hasConflict) {
        setErrors({
          date: "Denne datoen er utilgjengelig",
        });
        setIsSubmitting(false);
        return;
      }

      const slug = await generateUniqueSlug(formData.title, formData.date);

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
        setIsSubmitting(false);
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
      setErrors((prev) => ({
        ...prev,
        _form: "Det oppstod en feil ved lagring av arrangementet",
      }));
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
      setCanTogglePrivate(true);
      setCanToggleWaitlist(true);
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
        setCanTogglePrivate(!template.isPrivate);
        setCanToggleWaitlist(!template.allowWaitlist);
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
    canTogglePrivate,
    canToggleWaitlist,
  };
};
