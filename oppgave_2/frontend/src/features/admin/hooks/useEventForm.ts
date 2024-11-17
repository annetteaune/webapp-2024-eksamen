import { useState, useEffect } from "react";
import { Event } from "@/features/events/interfaces";
import { EventFormFields, Template, Type } from "../interfaces";
import { fetcher } from "@/api/fetcher";
import { validateField, type ValidationErrors } from "../helpers/validate";
import { eventFormSchema } from "../helpers/validate";

interface UseEventFormProps {
  initialData?: Event;
  onSubmit: (data: Omit<Event, "id" | "status" | "waitlist">) => Promise<void>;
  onClose: () => void;
}

export const useEventForm = ({
  initialData,
  onSubmit,
  onClose,
}: UseEventFormProps) => {
  const [formData, setFormData] = useState<EventFormFields>({
    slug: initialData?.slug ?? "",
    title: initialData?.title ?? "",
    descriptionShort: initialData?.descriptionShort ?? "",
    descriptionLong: initialData?.descriptionLong ?? "",
    date: initialData?.date ?? "",
    location: initialData?.location ?? "",
    typeId: initialData?.type.id ?? "",
    capacity: initialData?.capacity ?? 0,
    price: initialData?.price ?? 0,
    templateId: initialData?.templateId,
    allowWaitlist: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [types, setTypes] = useState<Type[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesResponse, templatesResponse] = await Promise.all([
          fetcher<TypesResponse>("/types"),
          fetcher<{ templates: Template[] }>("/templates"),
        ]);
        setTypes(typesResponse.types);
        setTemplates(templatesResponse.templates);
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };
    fetchData();
  }, []);

  // claude.ai
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

  // claude.ai
  const applyTemplate = async (templateId: string) => {
    if (!templateId) {
      setFormData((prev) => ({
        ...prev,
        templateId: undefined,
        capacity: 0,
        price: 0,
        allowWaitlist: false,
        typeId: "",
      }));
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
          typeId: template.typeId,
        }));
      }
    } catch (error) {
      console.error("Error applying template:", error);
    }
  };

  // claude.ai
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      setIsSubmitting(true);

      const { templateId, allowWaitlist, ...requiredFields } = formData;

      const eventData = {
        slug: requiredFields.slug,
        title: requiredFields.title,
        descriptionShort: requiredFields.descriptionShort,
        descriptionLong: requiredFields.descriptionLong,
        date: new Date(requiredFields.date).toISOString(),
        location: requiredFields.location,
        type: {
          id: requiredFields.typeId,
          name: types.find((t) => t.id === requiredFields.typeId)?.name || "",
        },
        capacity: Number(requiredFields.capacity),
        price: Number(requiredFields.price),
        templateId: templateId || undefined,
        allowWaitlist: allowWaitlist || false,
      };

      await onSubmit(eventData as Omit<Event, "id" | "status" | "waitlist">);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors({
        _form:
          error instanceof Error
            ? error.message
            : "Det oppstod en feil ved lagring av arrangementet",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    types,
    templates,
    handleInputChange,
    handleSubmit,
    applyTemplate,
  };
};
