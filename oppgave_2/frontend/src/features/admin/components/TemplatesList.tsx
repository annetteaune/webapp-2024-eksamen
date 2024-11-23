import { FaEdit, FaTrash } from "react-icons/fa";
import { Template, Type } from "../interfaces";
import ErrorMessage from "@/components/ErrorMessage";
import { useTemplateManagement } from "../hooks/useTemplateManagement";

interface TemplatesListProps {
  templates: Template[];
  onDelete: (id: string) => Promise<{ success: boolean; message?: string }>;
  onEdit: (template: Template) => void;
}

export const TemplatesList = ({
  templates,
  onDelete,
  onEdit,
}: TemplatesListProps) => {
  const {
    loading,
    error,
    setError,
    getTypeName,
    handleEditClick,
    handleDeleteClick,
  } = useTemplateManagement();
  return (
    <div className="templates-section">
      <h3>Maler</h3>
      <ErrorMessage message={error} onDismiss={() => setError(null)} />
      <div className="templates-grid">
        {templates.map((template) => (
          <div key={template.id} className="template-card">
            <div className="template-info">
              <h4>{template.name}</h4>
              <p>
                Kapasitet: {template.maxCapacity} | Pris: {template.price} kr
              </p>
              <p>Type: {getTypeName(template.typeId)}</p>
            </div>
            <div className="template-actions">
              <button
                className="icon-btn edit"
                onClick={() => handleEditClick(template, onEdit)}
                disabled={loading === template.id}
              >
                <FaEdit />
                <span className="tooltip">Rediger mal</span>
              </button>
              <button
                className="icon-btn delete"
                onClick={() => handleDeleteClick(template, onDelete)}
                disabled={loading === template.id}
              >
                <FaTrash />
                <span className="tooltip">Slett mal</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
