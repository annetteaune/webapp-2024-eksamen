import { useState, useEffect } from "react";
import { Template, Type } from "../interfaces";
import { fetcher } from "@/api/fetcher";

export const useTemplateManagement = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [types, setTypes] = useState<Type[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const handleEditClick = async (
    template: Template,
    onEdit: (template: Template) => void
  ) => {
    try {
      setLoading(template.id);
      const response = await fetcher<{ events: any[] }>(
        `/events?template=${template.id}`
      );

      if (response.events?.length > 0) {
        setError("Kan ikke redigere maler som er i bruk.");
        return;
      }

      onEdit(template);
    } catch (error) {
      setError("Kunne ikke sjekke om malen er i bruk.");
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteClick = async (
    template: Template,
    onDelete: (id: string) => Promise<{ success: boolean; message?: string }>
  ) => {
    try {
      const response = await fetcher<{ events: any[] }>(
        `/events?template=${template.id}`
      );

      if (response.events?.length > 0) {
        setError("Kan ikke slette maler som er i bruk.");
        return;
      }

      if (
        window.confirm(
          "Er du sikker på at du vil slette denne malen? Dette kan ikke angres."
        )
      ) {
        const result = await onDelete(template.id);
        if (!result.success && result.message) {
          setError(result.message);
        }
      }
    } catch (error) {
      setError("Kunne ikke slette malen. Prøv igjen senere.");
    }
  };

  const getTypeName = (typeId: string) => {
    return types.find((type) => type.id === typeId)?.name || "Ukjent type";
  };

  return {
    loading,
    error,
    setError,
    getTypeName,
    handleEditClick,
    handleDeleteClick,
  };
};
