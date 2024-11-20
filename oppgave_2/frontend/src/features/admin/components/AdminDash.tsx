"use client";
import { useAdminDashboard } from "../hooks/useAdminDash";
import { Tabs } from "./Tabs";
import { ActionButtons } from "./ActionButtons";
import { EventsList } from "./EventsList";
import { TemplatesList } from "./TemplatesList";
import { NewTemplateForm } from "./NewTemplateForm";
import EventForm from "./EventForm";
import { Event } from "@/features/events/interfaces";
import { fetcher } from "@/api/fetcher";
import { Template } from "../interfaces";

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

      console.log("Sending to backend:", backendData);
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
    const result = await deleteEvent(eventId);
    if (!result.success && result.message) {
      alert(result.message);
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
    return <div className="loading">Laster inn...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2 className="page-title">Administrasjonspanel</h2>
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <ActionButtons
          activeTab={activeTab}
          onNewTemplate={() => setShowNewTemplateForm(true)}
          onNewEvent={() => setShowNewEventForm(true)}
        />
      </div>
      {activeTab === "templates" ? (
        <TemplatesList
          templates={templates}
          onDelete={deleteTemplate}
          onEdit={setSelectedTemplate}
        />
      ) : (
        <EventsList events={events} onDelete={handleDeleteEvent} />
      )}
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
