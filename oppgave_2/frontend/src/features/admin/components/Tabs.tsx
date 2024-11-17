import { TabType } from "../interfaces";

interface TabProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Tabs = ({ activeTab, setActiveTab }: TabProps) => (
  <div className="tabs">
    <button
      className={`tab-btn ${activeTab === "events" ? "active" : ""}`}
      onClick={() => setActiveTab("events")}
    >
      Arrangementer
    </button>
    <button
      className={`tab-btn ${activeTab === "templates" ? "active" : ""}`}
      onClick={() => setActiveTab("templates")}
    >
      Maler
    </button>
  </div>
);
