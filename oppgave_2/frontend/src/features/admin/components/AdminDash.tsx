"use client";
import { useAdminDashboard } from "../hooks/useAdminDash";
import { Tabs } from "./Tabs";
import { AdminButtons } from "./AdminButtons";
import { EventsList } from "./EventsList";
import { TemplatesList } from "./TemplatesList";
import { NewTemplateForm } from "./NewTemplateForm";
import EventForm from "./EventForm";
import { Event } from "@/features/events/interfaces";
import { fetcher } from "@/api/fetcher";
import { Template } from "../interfaces";
import { useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import ExportBookings from "./ExportBookings";
import BookingsList from "./BookingsList";
import Loader from "@/components/Loader";

const AdminDashboard = () => {
  const {
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
  } = useAdminDashboard();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      const response = await fetcher("/events", {
        method: "POST",
        body: JSON.stringify(backendData),
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      window.location.reload();
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

  if (isLoading) {
    return <Loader />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "templates":
        return (
          <TemplatesList
            templates={templates}
            onDelete={deleteTemplate}
            onEdit={setSelectedTemplate}
          />
        );
      case "bookings":
        return (
          <>
            <ExportBookings />
            <BookingsList />
          </>
        );
      default:
        return <EventsList events={events} onDelete={handleDeleteEvent} />;
    }
  };

  return (
    <div className="admin-dashboard">
      <ErrorMessage
        message={errorMessage}
        onDismiss={() => setErrorMessage(null)}
      />
      <div className="dashboard-header">
        <h2 className="page-title">Administrasjonspanel</h2>
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab !== "bookings" && (
          <AdminButtons
            activeTab={activeTab}
            onNewTemplate={() => setShowNewTemplateForm(true)}
            onNewEvent={() => setShowNewEventForm(true)}
          />
        )}
      </div>
      {renderContent()}
      {showNewTemplateForm && (
        <NewTemplateForm
          onClose={() => setShowNewTemplateForm(false)}
          onSubmit={handleSubmitTemplate}
        />
      )}
      {selectedTemplate && (
        <NewTemplateForm
          onClose={() => setSelectedTemplate(null)}
          onSubmit={handleSubmitTemplate}
          initialData={selectedTemplate}
        />
      )}
      {showNewEventForm && (
        <EventForm
          onClose={() => setShowNewEventForm(false)}
          onSubmit={handleCreateEvent}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
