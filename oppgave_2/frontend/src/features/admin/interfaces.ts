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
  typeId: string;
  firmPrice: boolean;
}

export type TemplateFormData = {
  name: string;
  allowedDays: string[];
  maxCapacity: number;
  price: number;
  isPrivate: boolean;
  allowWaitlist: boolean;
  allowSameDay: boolean;
  typeId: string;
  firmPrice: boolean;
};

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
};

export type EventFormFields = RequiredEventFields & {
  templateId?: string;
  allowWaitlist: boolean;
};

export type TabType = "templates" | "events";
