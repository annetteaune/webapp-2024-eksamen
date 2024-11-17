"use client";
import { useState, useEffect } from "react";
import { Event } from "@/features/events/interfaces";
import { EventFormFields, RequiredEventFields, Template } from "../interfaces";
import { Type } from "../interfaces";
import { FaTimes } from "react-icons/fa";
import { fetcher } from "@/api/fetcher";
import {
  eventFormSchema,
  type EventFormData,
  type ValidationErrors,
  validateField,
  validateForm,
} from "../helpers/validate";

interface EventFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<Event, "id" | "status" | "waitlist">) => Promise<void>;
  initialData?: Event;
}

export const EventForm = ({
  onClose,
  onSubmit,
  initialData,
}: EventFormProps) => {
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      setIsSubmitting(true);

      const { templateId, ...requiredFields } = formData;
      const finalSubmissionData = templateId
        ? { ...requiredFields, templateId }
        : requiredFields;

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
        const typeSelect = document.querySelector(
          'select[name="typeId"]'
        ) as HTMLSelectElement;
        if (typeSelect) {
          typeSelect.disabled = true;
        }
      }
    } catch (error) {
      console.error("Error applying template:", error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content event-form-container">
        <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
          <FaTimes />
        </button>
        <h3>
          {initialData ? "Rediger arrangement" : "Opprett nytt arrangement"}
        </h3>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Mal (valgfritt)</label>
            <select
              value={formData.templateId || ""}
              onChange={(e) => applyTemplate(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Ingen mal</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>URL-slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange("slug", e.target.value)}
              className={errors.slug ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.slug && (
              <span className="error-message">{errors.slug}</span>
            )}
          </div>

          <div className="form-group">
            <label>Tittel</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={errors.title ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label>Kort beskrivelse</label>
            <input
              type="text"
              value={formData.descriptionShort}
              onChange={(e) =>
                handleInputChange("descriptionShort", e.target.value)
              }
              className={errors.descriptionShort ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.descriptionShort && (
              <span className="error-message">{errors.descriptionShort}</span>
            )}
          </div>

          <div className="form-group">
            <label>Lang beskrivelse</label>
            <textarea
              value={formData.descriptionLong}
              onChange={(e) =>
                handleInputChange("descriptionLong", e.target.value)
              }
              className={errors.descriptionLong ? "error" : ""}
              disabled={isSubmitting}
              rows={5}
            />
            {errors.descriptionLong && (
              <span className="error-message">{errors.descriptionLong}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Dato og tid</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className={errors.date ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.date && (
                <span className="error-message">{errors.date}</span>
              )}
            </div>

            <div className="form-group">
              <label>Lokasjon</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className={errors.location ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.location && (
                <span className="error-message">{errors.location}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                value={formData.typeId}
                onChange={(e) => handleInputChange("typeId", e.target.value)}
                className={errors.typeId ? "error" : ""}
                disabled={isSubmitting}
              >
                <option value="">Velg type</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.typeId && (
                <span className="error-message">{errors.typeId}</span>
              )}
            </div>

            <div className="form-group">
              <label>Kapasitet</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  handleInputChange("capacity", parseInt(e.target.value))
                }
                className={errors.capacity ? "error" : ""}
                disabled={isSubmitting || !!formData.templateId}
              />
              {errors.capacity && (
                <span className="error-message">{errors.capacity}</span>
              )}
            </div>

            <div className="form-group">
              <label>Pris</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  handleInputChange("price", parseInt(e.target.value))
                }
                className={errors.price ? "error" : ""}
                disabled={isSubmitting || !!formData.templateId}
              />
              {errors.price && (
                <span className="error-message">{errors.price}</span>
              )}
            </div>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.allowWaitlist}
                  onChange={(e) =>
                    handleInputChange("allowWaitlist", e.target.checked)
                  }
                  disabled={isSubmitting}
                />
                Tillat venteliste
              </label>
            </div>
          </div>

          <div className="btn-group">
            <button
              type="button"
              className="admin-btn btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="admin-btn primary-btn btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Lagrer..."
                : initialData
                ? "Oppdater arrangement"
                : "Opprett arrangement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
