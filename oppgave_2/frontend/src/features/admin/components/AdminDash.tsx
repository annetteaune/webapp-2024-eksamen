"use client";
import { useAdminDashboard } from "../hooks/useAdminDash";
import { Tabs } from "./Tabs";
import { ActionButtons } from "./ActionButtons";
import { EventsList } from "./EventsList";
import { TemplatesList } from "./TemplatesList";
import { NewTemplateForm } from "./NewTemplateForm";
import { EventForm } from "./EventForm";
import { Event } from "@/features/events/interfaces";
import { fetcher } from "@/api/fetcher";

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
  } = useAdminDashboard();

  const handleCreateEvent = async (
    eventData: Omit<Event, "id" | "status" | "waitlist">
  ) => {
    try {
      const response = await fetcher("/events", {
        method: "POST",
        body: JSON.stringify(eventData),
      });
      window.location.reload();
      return response;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
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
        <EventsList events={events} onDelete={deleteEvent} />
      )}
      {showNewTemplateForm && (
        <NewTemplateForm
          onClose={() => setShowNewTemplateForm(false)}
          onSubmit={createTemplate}
        />
      )}
      {selectedTemplate && (
        <NewTemplateForm
          onClose={() => setSelectedTemplate(null)}
          onSubmit={createTemplate}
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
