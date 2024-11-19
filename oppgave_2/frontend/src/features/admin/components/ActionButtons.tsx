import { FaPlus } from "react-icons/fa";
import { TabType } from "../interfaces";

interface ActionButtonsProps {
  activeTab: TabType;
  onNewTemplate: () => void;
  onNewEvent: () => void;
}

export const ActionButtons = ({
  activeTab,
  onNewTemplate,
  onNewEvent,
}: ActionButtonsProps) => (
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
