import { FaEdit, FaTrash } from "react-icons/fa";
import { Template, Type } from "../interfaces";
import { useState, useEffect } from "react";
import { fetcher } from "@/api/fetcher";

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
  const [loading, setLoading] = useState<string | null>(null);
  const [types, setTypes] = useState<Type[]>([]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetcher<{ types: Type[] }>("/types");
        setTypes(response.types);
      } catch (error) {
        console.error("Error fetching types:", error);
      }
    };
    fetchTypes();
  }, []);

  const getTypeName = (typeId: string) => {
    return types.find((type) => type.id === typeId)?.name || "Ukjent type";
  };

  const handleEditClick = async (template: Template) => {
    try {
      setLoading(template.id);
      const response = await fetcher<{ events: any[] }>(
        `/events?template=${template.id}`
      );

      if (response.events?.length > 0) {
        alert("Kan ikke redigere maler som er i bruk.");
        return;
      }

      onEdit(template);
    } catch (error) {
      console.error("Error checking template usage:", error);
      alert("Kunne ikke sjekke om malen er i bruk.");
    } finally {
      setLoading(null);
    }
  };

  return (
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
              <p>Type: {getTypeName(template.typeId)}</p>
            </div>
            <div className="template-actions">
              <button
                className="icon-btn edit"
                onClick={() => handleEditClick(template)}
                disabled={loading === template.id}
              >
                <FaEdit />
              </button>
              <button
                className="icon-btn delete"
                onClick={async () => {
                  const result = await onDelete(template.id);
                  if (!result.success && result.message) {
                    alert(result.message);
                  }
                }}
                disabled={loading === template.id}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
