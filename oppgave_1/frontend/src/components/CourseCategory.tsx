import { useState } from "react";
import { Category } from "@/interfaces/types";
import { fetcher } from "@/api/fetcher";

interface CourseCategoryProps {
  courseSlug: string;
  currentCategory: string;
  categories: Category[];
}
// har fått hjelp av claude.ai til å håndtere oppdatering av kategori
export default function CourseCategory({
  courseSlug,
  currentCategory,
  categories,
}: CourseCategoryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategoryChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newCategory = event.target.value;

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
  return (
    <div className="flex flex-col items-end gap-2">
      <span data-testid="course_category">
        Kategori:{" "}
        <span className="font-bold capitalize">{currentCategory}</span>
      </span>
      {isEditing ? (
        <select
          value={selectedCategory || currentCategory}
          onChange={handleCategoryChange}
          className="w-[200px] rounded border border-slate-300 px-2 py-1"
          data-testid="category-select"
        >
          <option value="">Velg ny kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      ) : (
        <button
          onClick={() => {
            setIsEditing(true);
            setSelectedCategory(currentCategory);
          }}
          className="text-sm font-semibold underline"
          data-testid="edit-category-button"
        >
          Endre kategori
        </button>
      )}
      {updateError && (
        <p className="text-sm text-red-600" data-testid="update-error">
          {updateError}
        </p>
      )}
    </div>
  );
}
