import { type Template } from "../repository";

export const toTemplateResponse = (template: Template) => ({
  id: template.id,
  name: template.name,
  allowedDays: template.allowed_days,
  maxCapacity: template.max_capacity,
  price: template.price,
  isPrivate: template.is_private,
  allowWaitlist: template.allow_waitlist,
  allowSameDay: template.allow_same_day,
  createdAt: template.created_at,
});

export const toTemplatesResponse = (templates: Template[]) => ({
  templates: templates.map(toTemplateResponse),
});
