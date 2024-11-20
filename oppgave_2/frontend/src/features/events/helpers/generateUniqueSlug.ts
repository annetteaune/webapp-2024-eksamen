import { format } from "date-fns";
import { fetcher } from "@/api/fetcher";
import { Event } from "../interfaces";

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

const checkSlugExists = async (slug: string): Promise<boolean> => {
  try {
    await fetcher(`/events/slug/${slug}`);
    return true;
  } catch {
    return false;
  }
};

const generateUniqueIdentifier = (): string => {
  return Math.random().toString(36).substring(2, 7);
};

export const generateUniqueSlug = async (
  title: string,
  date: string,
  existingEvents?: Event[]
): Promise<string> => {
  const baseSlug = sanitizeTitle(title);
  const dateSuffix = generateDateSuffix(date);
  let slug = `${baseSlug}-${dateSuffix}`;

  if (existingEvents?.some((event) => event.slug === slug)) {
    slug = `${baseSlug}-${dateSuffix}-${generateUniqueIdentifier()}`;
  } else {
    const exists = await checkSlugExists(slug);
    if (exists) {
      slug = `${baseSlug}-${dateSuffix}-${generateUniqueIdentifier()}`;
    }
  }

  return slug;
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
