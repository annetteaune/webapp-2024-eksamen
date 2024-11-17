import { type Template } from "../repository";

export const toTemplateResponse = (template: any) => ({
  id: template.id,
  name: template.name,
  allowedDays: template.allowed_days,
  maxCapacity: template.max_capacity,
  price: template.price,
  isPrivate: template.is_private,
  allowWaitlist: template.allow_waitlist,
  allowSameDay: template.allow_same_day,
  createdAt: template.created_at,
  typeId: template.type_id,
});

export const toTemplatesResponse = (templates: any[]) => ({
  templates: templates.map(toTemplateResponse),
});
