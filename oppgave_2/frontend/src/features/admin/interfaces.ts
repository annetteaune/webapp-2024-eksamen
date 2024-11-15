export interface Template {
  id: string;
  name: string;
  allowWaitlist: boolean;
  allowSameDay: boolean;
  maxCapacity: number;
  price: number;
  isPrivate: boolean;
  createdAt: string;
  allowedDays: string[];
}
