import { useState } from "react";
import { Course } from "@/interfaces/types";
import { SelectChangeEvent } from "@/interfaces/types";
import { useCategories } from "@/hooks/useCategories";
import { useCourses } from "@/hooks/useCourses";
import { fetcher } from "@/api/fetcher";
import Filter from "./Filter";
import CourseCard from "./CourseCard";

export default function Courses() {
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
    // godkjenne sletting
    const isConfirmed = window.confirm(
      `Er du sikker på at du vil slette ${title}? Dette kan ikke angres.`
    );

    if (!isConfirmed) {
      return; // abvryt om nei
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

  if (coursesLoading || categoriesLoading) {
    return <div>Laster inn...</div>;
  }

  if (coursesError || categoriesError) {
    return <div>Feil i innlasting av kurs</div>;
  }

  const displayedCourses = value ? filteredCourses : courses;

  return (
    <>
      <header className="mt-8 flex items-center justify-between">
        <h2 className="mb-6 text-xl font-bold" data-testid="title">
          Alle kurs
        </h2>
        <Filter categories={categories} value={value} onChange={handleFilter} />
      </header>

      {deleteError && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700" role="alert">
          {deleteError}
        </div>
      )}

      <section className="mt-6 grid grid-cols-3 gap-8" data-testid="courses">
        {displayedCourses && displayedCourses.length > 0 ? (
          displayedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onDelete={handleDelete}
              isDeleting={isDeleting === course.slug}
            />
          ))
        ) : (
          <p data-testid="empty">Ingen kurs</p>
        )}
      </section>
    </>
  );
}
