export interface Template {
  id: string;
  name: string;
  allowWaitlist: boolean;
  allowSameDay: boolean;
  maxCapacity: number;
  price: number;
  isPrivate: boolean;
  fixedPrice: boolean;
  createdAt: string;
  allowedDays: string[];
  typeId: string;
}

export interface TemplateFormData {
  name: string;
  allowedDays: DayOfWeek[];
  maxCapacity: number;
  price: number;
  isPrivate: boolean;
  fixedPrice: boolean;
  allowWaitlist: boolean;
  allowSameDay: boolean;
  typeId: string;
}

export type DayOfWeek =
  | "Mandag"
  | "Tirsdag"
  | "Onsdag"
  | "Torsdag"
  | "Fredag"
  | "Lørdag"
  | "Søndag";

export interface Type {
  id: string;
  name: string;
}

export interface TypesResponse {
  types: Type[];
}

export type RequiredEventFields = {
  slug: string;
  title: string;
  descriptionShort: string;
  descriptionLong: string;
  date: string;
  location: string;
  typeId: string;
  capacity: number;
  price: number;
  allowWaitlist: boolean;
  isPrivate: boolean;
  allowSameDay: boolean;
};

export type EventFormFields = RequiredEventFields & {
  templateId?: string;
  allowWaitlist: boolean;
  isPrivate: boolean;
  allowSameDay: boolean;
};
