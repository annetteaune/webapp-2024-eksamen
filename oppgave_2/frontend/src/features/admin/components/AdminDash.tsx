"use client";
import { useAdminDashboard } from "../hooks/useAdminDash";
import { Tabs } from "./Tabs";
import { AdminButtons } from "./AdminButtons";
import { EventsList } from "./EventsList";
import { TemplatesList } from "./TemplatesList";
import { NewTemplateForm } from "./NewTemplateForm";
import EventForm from "./EventForm";
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
    setEvents,
    showNewTemplateForm,
    setShowNewTemplateForm,
    showNewEventForm,
    setShowNewEventForm,
    selectedTemplate,
    setSelectedTemplate,
    isLoading,
    handleDeleteEvent,
    deleteTemplate,
    handleSubmitTemplate,
    handleCreateEvent,
    errorMessage,
    setErrorMessage,
  } = useAdminDashboard();

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
