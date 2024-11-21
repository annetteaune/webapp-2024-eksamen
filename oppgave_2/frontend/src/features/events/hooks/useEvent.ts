import { fetcher } from "@/api/fetcher";
import { Event } from "../interfaces";

export async function getEvent(slug: string) {
  try {
    const data = await fetcher<Event>(`/events/${slug}`);
    return data;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
}
