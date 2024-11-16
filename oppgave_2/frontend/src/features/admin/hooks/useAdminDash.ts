"use client";
import { useState, useEffect } from "react";
import { fetcher } from "@/api/fetcher";
import { Template } from "../interfaces";
import { Event } from "@/features/events/interfaces";

export type TabType = "templates" | "events";

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
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const deleteEvent = async (eventId: string) => {
    try {
      await fetcher(`/events/${eventId}`, {
        method: "DELETE",
      });
      setEvents(events.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      await fetcher(`/templates/${templateId}`, {
        method: "DELETE",
      });
      setTemplates(templates.filter((template) => template.id !== templateId));
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const createTemplate = async (
    formData: Omit<Template, "id" | "createdAt">
  ) => {
    try {
      const response = await fetcher("/templates", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setTemplates((prev) => [...prev, response]);
      setShowNewTemplateForm(false);
    } catch (error) {
      console.error("Error creating template:", error);
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
  };
};
