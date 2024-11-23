import Filter from "./Filter";
import CourseCard from "./CourseCard";
import { useCoursesListPage } from "@/hooks/useCoursesList";

export default function Courses() {
  const {
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
  } = useCoursesListPage();
  if (coursesLoading || categoriesLoading) {
    return <div>Laster inn...</div>;
  }

  if (coursesError || categoriesError) {
    return <div>Feil under innlasting av kurs</div>;
  }

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
