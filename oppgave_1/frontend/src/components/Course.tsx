import { Course as CourseType } from "@/interfaces/types";
import Link from "next/link";
import UsersList from "./UsersList";
import Lesson from "./Lesson";
import CourseCategory from "./CourseCategory";
import { useCourse } from "@/hooks/useCourse";
import { useCategories } from "@/hooks/useCategories";

interface CourseProps {
  courseSlug: string;
  lessonSlug?: string;
}

export default function Course({ courseSlug, lessonSlug }: CourseProps) {
  const { course, isLoading, error } = useCourse(courseSlug);
  const { categories } = useCategories();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-lg">Laster inn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <p className="text-lg">Kunne ikke laste inn kurset: {error.message}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-lg">Fant ikke kurset</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[250px_minmax(20%,1fr)_1fr] gap-16">
      <aside className="border-r border-slate-200 pr-6">
        <h3 className="mb-4 text-base font-bold">Leksjoner</h3>
        <ul data-testid="lessons">
          {course.lessons?.map((lesson) => (
            <li
              className={`text-sm mb-4 w-full max-w-[95%] rounded-lg border border-slate-300 px-4 py-2 ${
                lessonSlug === lesson.slug ? "bg-emerald-300" : ""
              }`}
              key={lesson.id}
            >
              <Link
                data-testid="lesson_url"
                data-slug={lesson.slug}
                className="block h-full w-full"
                href={`/kurs/${course.slug}/${lesson.slug}`}
              >
                {lesson.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      {lessonSlug ? (
        <article>
          <Lesson courseSlug={courseSlug} lessonSlug={lessonSlug} />
        </article>
      ) : (
        <section>
          <div className="flex justify-between">
            <h3 data-testid="course_title" className="mb-6 text-base font-bold">
              <a className="underline" href={`/kurs/${course?.slug}`}>
                {course?.title}
              </a>
            </h3>
            <CourseCategory
              courseSlug={course.slug}
              currentCategory={course.category}
              categories={categories}
            />
          </div>
          <p
            data-testid="course_description"
            className="mt-4 font-semibold leading-relaxed"
          >
            {course?.description}
          </p>
        </section>
      )}
      <UsersList />
    </div>
  );
}
