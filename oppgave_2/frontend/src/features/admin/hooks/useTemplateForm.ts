import { useState, useEffect } from "react";
import { DayOfWeek, Template, TemplateFormData, Type } from "../interfaces";
import { fetcher } from "@/api/fetcher";
import {
  templateFormSchema,
  type ValidationErrors,
  validateField,
  validateForm,
} from "../helpers/validate";
import { endpoints } from "@/api/urls";

interface UseTemplateFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<Template, "id" | "createdAt">) => Promise<void>;
  initialData?: Template;
}

export const useTemplateForm = ({
  onSubmit,
  onClose,
  initialData,
}: UseTemplateFormProps) => {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: initialData?.name ?? "",
    allowedDays: (initialData?.allowedDays as DayOfWeek[]) ?? [],
    maxCapacity: initialData?.maxCapacity ?? 0,
    price: initialData?.price ?? 0,
    isPrivate: initialData?.isPrivate ?? false,
    allowWaitlist: initialData?.allowWaitlist ?? false,
    allowSameDay: initialData?.allowSameDay ?? true,
    fixedPrice: initialData?.fixedPrice ?? false,
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
        const response = await fetcher<{ types: Type[] }>(endpoints.types.base);
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

  return {
    formData,
    types,
    errors,
    isSubmitting,
    daysOfWeek,
    handleDayToggle,
    handleInputChange,
    handleSubmit,
  };
};
