// claude.ai - hele koden
import { z } from "zod";

export const templateFormSchema = z.object({
  name: z
    .string()
    .min(1, "Navn på mal er påkrevd")
    .max(100, "Navn kan ikke være lengre enn 100 tegn"),
  allowedDays: z
    .array(
      z.enum([
        "Mandag",
        "Tirsdag",
        "Onsdag",
        "Torsdag",
        "Fredag",
        "Lørdag",
        "Søndag",
      ])
    )
    .min(1, "Velg minst én tillatt dag"),
  maxCapacity: z
    .number()
    .int("Kapasitet må være et helt tall")
    .positive("Kapasitet må være større enn 0")
    .max(1000, "Kapasitet kan ikke være større enn 1000"),
  price: z
    .number()
    .min(0, "Pris kan ikke være negativ")
    .max(10000, "Pris kan ikke være større enn 10000"),
  isPrivate: z.boolean(),
  fixedPrice: z.boolean(),
  allowWaitlist: z.boolean(),
  allowSameDay: z.boolean(),
  typeId: z.string().min(1, "Velg en arrangementstype"),
});

export const eventFormSchema = z.object({
  slug: z
    .string()
    .min(1, "URL-slug er påkrevd")
    .regex(
      /^[a-z0-9-]+$/,
      "URL-slug kan kun inneholde små bokstaver, tall og bindestrek"
    ),
  title: z
    .string()
    .min(1, "Tittel er påkrevd")
    .max(100, "Tittel kan ikke være lengre enn 100 tegn"),
  descriptionShort: z
    .string()
    .min(1, "Kort beskrivelse er påkrevd")
    .max(200, "Kort beskrivelse kan ikke være lengre enn 200 tegn"),
  descriptionLong: z
    .string()
    .min(1, "Lang beskrivelse er påkrevd")
    .max(2000, "Lang beskrivelse kan ikke være lengre enn 2000 tegn"),
  date: z.string().refine((date) => {
    const eventDate = new Date(date);
    const now = new Date();
    return eventDate > now;
  }, "Dato må være i fremtiden"),
  location: z.string().min(1, "Lokasjon er påkrevd"),
  typeId: z.string().min(1, "Velg en arrangementstype"),
  capacity: z.number().positive("Kapasitet må være større enn 0"),
  price: z.number().min(0, "Pris kan ikke være negativ"),
  templateId: z.string().optional(),
  allowWaitlist: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
  allowSameDay: z.boolean(),
});

export type TemplateFormData = z.infer<typeof templateFormSchema>;
export type EventFormData = z.infer<typeof eventFormSchema>;
export type ValidationErrors = Partial<Record<string, string>>;

// claude.ai
export const validateField = <T extends z.ZodObject<any>>(
  schema: T,
  field: keyof z.infer<T>,
  value: string | number | boolean | string[],
  data: z.infer<T>
): ValidationErrors => {
  try {
    if (Array.isArray(value)) {
      const fieldSchema = schema.shape[field];
      if (fieldSchema) {
        fieldSchema.parse(value);
      }
      return {};
    }

    if (typeof value === "boolean") {
      return {};
    }

    const fieldSchema = schema.shape[field];
    if (fieldSchema) {
      fieldSchema.parse(value);
    }
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { [field]: error.errors[0].message };
    }
    return { [field]: "Validering feilet" };
  }
};

export const validateForm = <T extends z.ZodObject<any>>(
  schema: T,
  data: z.infer<T>
): { isValid: boolean; errors: ValidationErrors } => {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationErrors = {};
      error.errors.forEach((err) => {
        if (err.path) {
          errors[err.path[0]] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return {
      isValid: false,
      errors: { _form: "Noe gikk galt med valideringen" },
    };
  }
};
