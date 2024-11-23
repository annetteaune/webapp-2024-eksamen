"use client";
import { useState, useEffect } from "react";
import { fetcher } from "@/api/fetcher";
import { Template } from "../interfaces";
import { Event } from "@/features/events/interfaces";
import { endpoints } from "@/api/urls";

export type TabType = "templates" | "events" | "bookings";

export const useAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("events");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [templatesResponse, eventsResponse] = await Promise.all([
          fetcher(endpoints.templates.base),
          fetcher(endpoints.events.filtered({ includePrivate: "true" })),
        ]);
        setTemplates(templatesResponse.templates);
        setEvents(eventsResponse.events);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetcher(endpoints.events.byId(eventId), {
        method: "DELETE",
        ignoreResponseError: true,
      });

      if (response?.success) {
        setEvents((prev) => prev.filter((event) => event.id !== eventId));
        return { success: true };
      }
      return {
        success: false,
        message: response?.error?.message || "Kunne ikke slette arrangementet",
      };
    } catch (error: any) {
      console.error("Delete event error:", error);

      if (error.response?.status === 400) {
        return {
          success: false,
          message: "Kan ikke slette arrangement som har påmeldinger.",
        };
      }
      return {
        success: false,
        message: "En uventet feil oppstod under sletting av arrangementet",
      };
    }
  };

  // claude.ai
  const deleteTemplate = async (
    templateId: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const checkResponse = await fetcher<{ events: any[] }>(
        endpoints.events.filtered({ template: templateId })
      );
      if (checkResponse.events?.length > 0) {
        return {
          success: false,
          message: "Kan ikke slette maler som er i bruk.",
        };
      }
      await fetcher(endpoints.templates.byId(templateId), {
        method: "DELETE",
      });
      setTemplates(templates.filter((template) => template.id !== templateId));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: "Det oppstod en uventet feil under sletting av malen.",
      };
    }
  };

  const createTemplate = async (
    formData: Omit<Template, "id" | "createdAt">
  ) => {
    //endre fra camelcase til snakecase
    const backendData = {
      name: formData.name,
      allowed_days: formData.allowedDays,
      max_capacity: formData.maxCapacity,
      price: formData.price,
      is_private: formData.isPrivate,
      allow_waitlist: formData.allowWaitlist,
      allow_same_day: formData.allowSameDay,
      fixed_price: formData.fixedPrice,
      type_id: formData.typeId,
    };
    const response = await fetcher(endpoints.templates.base, {
      method: "POST",
      body: JSON.stringify(backendData),
    });
    if (response?.error) {
      return {
        success: false,
        error: "Kunne ikke opprette malen.",
      };
    }
    setTemplates((prev) => [...prev, response]);
    setShowNewTemplateForm(false);
    return { success: true };
  };

  const updateTemplate = async (
    templateId: string,
    formData: Omit<Template, "id" | "createdAt">
  ) => {
    const backendData = {
      name: formData.name,
      allowed_days: formData.allowedDays,
      max_capacity: formData.maxCapacity,
      price: formData.price,
      is_private: formData.isPrivate,
      allow_waitlist: formData.allowWaitlist,
      allow_same_day: formData.allowSameDay,
      fixed_price: formData.fixedPrice,
      type_id: formData.typeId,
    };

    try {
      const response = await fetcher(endpoints.templates.byId(templateId), {
        method: "PATCH",
        body: JSON.stringify(backendData),
      });

      if (response?.error) {
        return {
          success: false,
          error: "Kunne ikke oppdatere malen.",
        };
      }

      setTemplates((prev) =>
        prev.map((template) =>
          template.id === templateId
            ? {
                ...template,
                ...formData,
              }
            : template
        )
      );
      setSelectedTemplate(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "Det oppstod en feil under oppdatering av malen.",
      };
    }
  };

  const handleCreateEvent = async (
    eventData: Omit<Event, "id" | "status" | "waitlist">
  ) => {
    try {
      const backendData = {
        slug: eventData.slug,
        title: eventData.title,
        description_short: eventData.descriptionShort,
        description_long: eventData.descriptionLong,
        date: new Date(eventData.date).toISOString(),
        location: eventData.location,
        type_id: eventData.type.id,
        capacity: Number(eventData.capacity),
        price: Number(eventData.price),
        is_private: Boolean(eventData.isPrivate),
        allow_same_day: Boolean(eventData.allowSameDay),
        allow_waitlist: Boolean(eventData.allowWaitlist),
        ...(eventData.templateId && { template_id: eventData.templateId }),
      };

      const response = await fetcher(endpoints.events.base, {
        method: "POST",
        body: JSON.stringify(backendData),
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setEvents((prev) => [...prev, response]);
      setShowNewEventForm(false);
      return response;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  };
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const result = await deleteEvent(eventId);
      if (!result.success) {
        setErrorMessage(result.message || "Kunne ikke slette arrangementet");
      }
    } catch (error) {
      setErrorMessage(
        "En uventet feil oppstod under sletting av arrangementet"
      );
    }
  };

  const handleSubmitTemplate = async (
    data: Omit<Template, "id" | "createdAt">
  ) => {
    if (selectedTemplate) {
      const result = await updateTemplate(selectedTemplate.id, data);
      if (!result.success) {
        throw new Error(result.error);
      }
    } else {
      const result = await createTemplate(data);
      if (!result.success) {
        throw new Error(result.error);
      }
    }
  };

  return {
    activeTab,
    setActiveTab,
    templates,
    events,
    setEvents,
    showNewTemplateForm,
    setShowNewTemplateForm,
    showNewEventForm,
    setShowNewEventForm,
    selectedTemplate,
    setSelectedTemplate,
    isLoading,
    deleteEvent,
    deleteTemplate,
    createTemplate,
    updateTemplate,
    handleCreateEvent,
    handleDeleteEvent,
    handleSubmitTemplate,
    errorMessage,
    setErrorMessage,
  };
};
