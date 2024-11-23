import { useState } from "react";
import { Course, SelectChangeEvent } from "@/interfaces/types";
import { useCategories } from "@/hooks/useCategories";
import { useCourses } from "@/hooks/useCourses";
import { fetcher } from "@/api/fetcher";

export const useCoursesListPage = () => {
  const [value, setValue] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    courses,
    setCourses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useCourses();

  const handleFilter = (event: SelectChangeEvent) => {
    const category = event.target.value;
    setValue(category);
    if (category && category.length > 0) {
      const filtered = courses.filter((course) =>
        course.category.toLowerCase().includes(category.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    const isConfirmed = window.confirm(
      `Er du sikker på at du vil slette ${title}? Dette kan ikke angres.`
    );

    if (!isConfirmed) {
      return;
    }

    setIsDeleting(slug);
    setDeleteError(null);

    try {
      const response = await fetcher(`/kurs/${slug}`, {
        method: "DELETE",
      });

      if (response.success) {
        const updatedCourses = courses.filter((course) => course.slug !== slug);
        setCourses(updatedCourses);
        if (value) {
          setFilteredCourses(
            updatedCourses.filter((course) =>
              course.category.toLowerCase().includes(value.toLowerCase())
            )
          );
        }
      } else {
        throw new Error(response.error?.message || "Failed to delete course");
      }
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete course"
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const displayedCourses = value ? filteredCourses : courses;

  return {
    value,
    isDeleting,
    deleteError,
    categories,
    categoriesLoading,
    categoriesError,
    coursesLoading,
    coursesError,
    displayedCourses,
    handleFilter,
    handleDelete,
  };
};
