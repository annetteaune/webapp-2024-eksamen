export interface Event {
  id: string;
  slug: string;
  title: string;
  descriptionShort: string;
  descriptionLong: string;
  date: string;
  location: string;
  type: {
    id: string;
    name: string;
  };
  capacity: number;
  price: number;
  templateId: string;
  status: "Ledige plasser" | "Fullbooket";
  allowWaitlist: boolean;
  isPrivate: boolean;
  waitlist: Array<{
    name: string;
    email: string;
    status: "På venteliste";
    added_at: string;
  }> | null;
}

export interface EventsResponse {
  events: Event[];
}
export type BookingCounts = {
  approved: number;
  pending: number;
  waitlist: number;
  total: number;
};
