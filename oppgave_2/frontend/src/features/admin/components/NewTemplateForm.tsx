"use client";
import { useEffect, useState } from "react";
import { Template, Type } from "../interfaces";
import { FaTimes } from "react-icons/fa";
import {
  templateFormSchema,
  type ValidationErrors,
  validateField,
  validateForm,
} from "../helpers/validate";
import { fetcher } from "@/api/fetcher";

type DayOfWeek =
  | "Mandag"
  | "Tirsdag"
  | "Onsdag"
  | "Torsdag"
  | "Fredag"
  | "Lørdag"
  | "Søndag";

interface TemplateFormData {
  name: string;
  allowedDays: DayOfWeek[];
  maxCapacity: number;
  price: number;
  isPrivate: boolean;
  allowWaitlist: boolean;
  allowSameDay: boolean;
  typeId: string;
}

interface TemplateFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<Template, "id" | "createdAt">) => Promise<void>;
  initialData?: Template;
}

export const NewTemplateForm = ({
  onClose,
  onSubmit,
  initialData,
}: TemplateFormProps) => {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: initialData?.name ?? "",
    allowedDays: (initialData?.allowedDays as DayOfWeek[]) ?? [],
    maxCapacity: initialData?.maxCapacity ?? 0,
    price: initialData?.price ?? 0,
    isPrivate: initialData?.isPrivate ?? false,
    allowWaitlist: initialData?.allowWaitlist ?? false,
    allowSameDay: initialData?.allowSameDay ?? true,
    typeId: initialData?.typeId ?? "",
  });

  const [types, setTypes] = useState<Type[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysOfWeek: DayOfWeek[] = [
    "Mandag",
    "Tirsdag",
    "Onsdag",
    "Torsdag",
    "Fredag",
    "Lørdag",
    "Søndag",
  ];

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetcher<{ types: Type[] }>("/types");
        setTypes(response.types);
      } catch (error) {
        console.error("Error fetching types:", error);
      }
    };

    fetchTypes();

    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        typeId: initialData.typeId,
      }));
    }
  }, [initialData]);

  // claude.ai
  const handleDayToggle = (day: DayOfWeek) => {
    const newDays = formData.allowedDays.includes(day)
      ? formData.allowedDays.filter((d) => d !== day)
      : [...formData.allowedDays, day];

    const newData = { ...formData, allowedDays: newDays };
    setFormData(newData);

    const newErrors = validateField(
      templateFormSchema,
      "allowedDays",
      newDays,
      newData
    );
    setErrors((prev) => ({ ...prev, ...newErrors }));
  };

  // claude.ai
  const handleInputChange = (
    field: keyof TemplateFormData,
    value: string | number | boolean | DayOfWeek[]
  ) => {
    let processedValue = value;
    if (field === "maxCapacity" || field === "price") {
      processedValue = value === "" ? 0 : Number(value);
    }

    const newData = {
      ...formData,
      [field]: processedValue,
    } as TemplateFormData;
    setFormData(newData);

    if (Array.isArray(value)) {
      const newErrors = validateField(
        templateFormSchema,
        field,
        value,
        newData
      );
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    if (typeof value === "boolean") {
      return;
    }

    const fieldSchema =
      templateFormSchema.shape[field as keyof typeof templateFormSchema.shape];
    if (fieldSchema) {
      const newErrors = validateField(
        templateFormSchema,
        field,
        processedValue,
        newData
      );
      setErrors((prev) => ({ ...prev, ...newErrors }));
    }
  };

  // claude.ai
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      setIsSubmitting(true);
      const dataToValidate = {
        ...formData,
        maxCapacity: Number(formData.maxCapacity),
        price: Number(formData.price),
      };

      const { isValid, errors: validationErrors } = validateForm(
        templateFormSchema,
        dataToValidate
      );

      if (!isValid) {
        setErrors(validationErrors);
        return;
      }

      await onSubmit(dataToValidate);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors({
        _form:
          error instanceof Error
            ? error.message
            : "Det oppstod en feil ved lagring av malen",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content template-form-container">
        <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
          <FaTimes />
        </button>
        <h3>{initialData ? "Rediger mal" : "Opprett ny mal"}</h3>

        {errors._form && <div className="error-message">{errors._form}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Navn på mal</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label>Type arrangement</label>
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
            <label>Tillatte dager</label>
            <div className="days-container">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`day-btn ${
                    formData.allowedDays.includes(day) ? "selected" : ""
                  }`}
                  disabled={isSubmitting}
                >
                  {day}
                </button>
              ))}
            </div>
            {errors.allowedDays && (
              <span className="error-message">{errors.allowedDays}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kapasitet</label>
              <input
                type="number"
                value={formData.maxCapacity}
                onChange={(e) =>
                  handleInputChange("maxCapacity", e.target.value)
                }
                className={errors.maxCapacity ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.maxCapacity && (
                <span className="error-message">{errors.maxCapacity}</span>
              )}
            </div>
            <div className="form-group">
              <label>Pris</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                className={errors.price ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.price && (
                <span className="error-message">{errors.price}</span>
              )}
            </div>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) =>
                  handleInputChange("isPrivate", e.target.checked)
                }
                disabled={isSubmitting}
              />
              Privat arrangement
            </label>

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

            <label>
              <input
                type="checkbox"
                checked={formData.allowSameDay}
                onChange={(e) =>
                  handleInputChange("allowSameDay", e.target.checked)
                }
                disabled={isSubmitting}
              />
              Tillat samme dag
            </label>
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
                ? "Oppdater mal"
                : "Lagre mal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
