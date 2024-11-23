import { format } from "date-fns";
import { fetcher } from "@/api/fetcher";
import { Event } from "../interfaces";
import { endpoints } from "@/api/urls";

// claude.ai - hele koden

const sanitizeTitle = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const generateDateSuffix = (date: string): string => {
  return format(new Date(date), "dd-MM-yy");
};

const generateUniqueIdentifier = (): string => {
  return Math.random().toString(36).substring(2, 7);
};

export const generateUniqueSlug = async (
  title: string,
  date: string
): Promise<string> => {
  try {
    const response = await fetcher<{ events: Event[] }>(
      endpoints.events.filtered({ includePrivate: "true" })
    );
    const existingEvents = response.events;

    const baseSlug = sanitizeTitle(title);
    const dateSuffix = generateDateSuffix(date);
    let slug = `${baseSlug}-${dateSuffix}`;

    const slugExists = existingEvents.some((event) => event.slug === slug);

    if (slugExists) {
      slug = `${baseSlug}-${dateSuffix}-${generateUniqueIdentifier()}`;
    }

    return slug;
  } catch (error) {
    console.warn(
      "Could not check existing slugs, generating unique slug with identifier"
    );
    const baseSlug = sanitizeTitle(title);
    const dateSuffix = generateDateSuffix(date);
    return `${baseSlug}-${dateSuffix}-${generateUniqueIdentifier()}`;
  }
};

export const getSlugErrorMessage = (slug: string): string | undefined => {
  if (slug.length < 1) {
    return "URL-slug er påkrevd";
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return "URL-slug kan kun inneholde små bokstaver, tall og bindestrek";
  }
  return undefined;
};
