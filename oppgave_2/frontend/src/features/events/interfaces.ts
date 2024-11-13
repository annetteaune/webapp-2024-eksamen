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
  status: "Ledig" | "Fullbooket";
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
