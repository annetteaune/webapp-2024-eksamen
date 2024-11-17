import { fetcher } from "@/api/fetcher";
import { Event } from "../interfaces";

export async function getEvent(slug: string): Promise<Event | null> {
  try {
    const response = await fetcher<{ events: Event[] }>(`/events?slug=${slug}`);

    if (response && response.events && response.events.length > 0) {
      return response.events[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
}
