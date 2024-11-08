import { useState } from "react";
import { Course } from "@/interfaces/types";
import { SelectChangeEvent } from "@/interfaces/types";
import { useCategories } from "@/hooks/useCategories";
import { useCourses } from "@/hooks/useCourses";

export default function Courses() {
  const [value, setValue] = useState<string>("");
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const {
    courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useCourses();
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

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

  if (coursesLoading || categoriesLoading) {
    return <div>Loading...</div>;
  }

  if (coursesError || categoriesError) {
    return <div>Error loading data</div>;
  }

  const displayedCourses = value ? filteredCourses : courses;

  return (
    <>
      <header className="mt-8 flex items-center justify-between">
        <h2 className="mb-6 text-xl font-bold" data-testid="title">
          Alle kurs
        </h2>
        <label className="flex flex-col text-xs font-semibold" htmlFor="filter">
          <span className="sr-only mb-1 block">Velg kategori:</span>
          <select
            id="filter"
            name="filter"
            data-testid="filter"
            value={value}
            onChange={handleFilter}
            className="min-w-[200px] rounded bg-slate-200"
          >
            <option value="">Alle</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </header>
      <section className="mt-6 grid grid-cols-3 gap-8" data-testid="courses">
        {displayedCourses && displayedCourses.length > 0 ? (
          displayedCourses.map((course) => (
            <article
              className="rounded-lg border border-slate-400 px-6 py-8"
              key={course.id}
              data-testid="course_wrapper"
            >
              <span className="block text-right capitalize">
                [{course.category}]
              </span>
              <h3
                className="mb-2 text-base font-bold"
                data-testid="courses_title"
              >
                <a href={`/kurs/${course.slug}`}>{course.title}</a>
              </h3>
              <p
                className="mb-6 text-base font-light"
                data-testid="courses_description"
              >
                {course.description}
              </p>
              <a
                className="font-semibold underline"
                data-testid="courses_url"
                href={`/kurs/${course.slug}`}
              >
                Til kurs
              </a>
            </article>
          ))
        ) : (
          <p data-testid="empty">Ingen kurs</p>
        )}
      </section>
    </>
  );
}
