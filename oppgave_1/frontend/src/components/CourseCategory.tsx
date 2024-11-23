import { Category } from "@/interfaces/types";
import { useCourseCategory } from "@/hooks/useCourseCategory";

interface CourseCategoryProps {
  courseSlug: string;
  currentCategory: string;
  categories: Category[];
}
export default function CourseCategory({
  courseSlug,
  currentCategory,
  categories,
}: CourseCategoryProps) {
  const {
    isEditing,
    updateError,
    selectedCategory,
    handleCategoryChange,
    startEditing,
  } = useCourseCategory(courseSlug);

  return (
    <div className="flex flex-col items-end gap-2">
      <span data-testid="course_category">
        Kategori:{" "}
        <span className="font-bold capitalize">{currentCategory}</span>
      </span>
      {isEditing ? (
        <select
          value={selectedCategory || currentCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
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
          onClick={startEditing}
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
