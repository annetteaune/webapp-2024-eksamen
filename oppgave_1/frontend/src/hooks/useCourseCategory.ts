import { useState } from "react";
import { fetcher } from "@/api/fetcher";

// har fått hjelp av claude.ai til å håndtere oppdatering av kategori
export const useCourseCategory = (courseSlug: string) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategoryChange = async (newCategory: string) => {
    if (newCategory === "") {
      return;
    }

    setSelectedCategory(newCategory);

    try {
      const response = await fetcher(`/kurs/${courseSlug}/category`, {
        method: "PATCH",
        body: JSON.stringify({ category: newCategory.toLowerCase() }),
      });

      if (response.success) {
        window.location.reload();
      } else {
        throw new Error(response.error?.message || "Failed to update category");
      }
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Failed to update category"
      );
    } finally {
      setIsEditing(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setSelectedCategory("");
  };

  return {
    isEditing,
    updateError,
    selectedCategory,
    handleCategoryChange,
    startEditing,
  };
};
