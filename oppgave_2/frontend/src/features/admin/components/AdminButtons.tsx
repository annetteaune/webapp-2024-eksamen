import { FaPlus } from "react-icons/fa";
import { TabType } from "../hooks/useAdminDash";

interface AdminButtonProps {
  activeTab: TabType;
  onNewTemplate: () => void;
  onNewEvent: () => void;
}

export const AdminButtons = ({
  activeTab,
  onNewTemplate,
  onNewEvent,
}: AdminButtonProps) => {
  if (activeTab === "bookings") return null;

  return (
    <div className="admin-btn-wrapper">
      {activeTab === "events" && (
        <button className="admin-btn primary-btn btn" onClick={onNewEvent}>
          <FaPlus /> Nytt arrangement
        </button>
      )}
      <button className="admin-btn btn" onClick={onNewTemplate}>
        <FaPlus /> Ny mal
      </button>
    </div>
  );
};
