import { fetcher } from "@/api/fetcher";
import { Event } from "../interfaces";
import { endpoints } from "@/api/urls";

export async function getEvent(slug: string) {
  try {
    const data = await fetcher<Event>(endpoints.events.bySlug(slug));
    return data;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
}
