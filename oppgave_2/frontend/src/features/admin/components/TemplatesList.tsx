import { FaEdit, FaTrash } from "react-icons/fa";
import { Template } from "../interfaces";

interface TemplatesListProps {
  templates: Template[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (template: Template) => void;
}

export const TemplatesList = ({
  templates,
  onDelete,
  onEdit,
}: TemplatesListProps) => (
  <div className="templates-section">
    <h3>Maler</h3>
    <div className="templates-grid">
      {templates.map((template) => (
        <div key={template.id} className="template-card">
          <div className="template-info">
            <h4>{template.name}</h4>
            <p>
              Kapasitet: {template.maxCapacity} | Pris: {template.price} kr
            </p>
          </div>
          <div className="template-actions">
            <button className="icon-btn edit" onClick={() => onEdit(template)}>
              <FaEdit />
            </button>
            <button
              className="icon-btn delete"
              onClick={() => onDelete(template.id)}
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
