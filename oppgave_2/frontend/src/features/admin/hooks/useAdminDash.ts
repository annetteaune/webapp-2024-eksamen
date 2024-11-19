"use client";
import { useState, useEffect } from "react";
import { fetcher } from "@/api/fetcher";
import { TabType, Template } from "../interfaces";
import { Event } from "@/features/events/interfaces";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [templatesResponse, eventsResponse] = await Promise.all([
          fetcher("/templates"),
          fetcher("/events"),
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
      const response = await fetcher(`/events/${eventId}`, {
        method: "DELETE",
      });
      setEvents(events.filter((event) => event.id !== eventId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting event:", error);

      return {
        success: false,
        message: "Det oppstod en uventet feil under sletting av arrangementet.",
      };
    }
  };

  // claude.ai
  const deleteTemplate = async (
    templateId: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const checkResponse = await fetcher<{ events: any[] }>(
        `/events?template=${templateId}`
      );
      if (checkResponse.events?.length > 0) {
        return {
          success: false,
          message: "Kan ikke slette maler som er i bruk.",
        };
      }
      await fetcher(`/templates/${templateId}`, {
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
      type_id: formData.typeId,
      firm_price: formData.firmPrice,
    };

    console.log("Sending template data:", backendData);

    const response = await fetcher("/templates", {
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
      type_id: formData.typeId,
    };

    try {
      const response = await fetcher(`/templates/${templateId}`, {
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

  return {
    activeTab,
    setActiveTab,
    templates,
    events,
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
  };
};
