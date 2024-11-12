import type { Course } from "@/interfaces/types";

interface CourseCardProps {
  course: Course;
  onDelete: (slug: string, title: string) => Promise<void>;
  isDeleting: boolean;
}

export default function CourseCard({
  course,
  onDelete,
  isDeleting,
}: CourseCardProps) {
  return (
    <article
      className="relative rounded-lg border border-slate-400 px-6 py-8"
      data-testid="course_wrapper"
    >
      <span className="block text-right capitalize">[{course.category}]</span>
      <h3 className="mb-2 text-base font-bold" data-testid="courses_title">
        <a href={`/kurs/${course.slug}`}>{course.title}</a>
      </h3>
      <p
        className="mb-6 text-base font-light"
        data-testid="courses_description"
      >
        {course.description}
      </p>
      <div className="flex items-center justify-between">
        <a
          className="font-semibold underline"
          data-testid="courses_url"
          href={`/kurs/${course.slug}`}
        >
          Til kurs
        </a>
        <button
          onClick={() => onDelete(course.slug, course.title)}
          disabled={isDeleting}
          className="font-semibold text-red-600 hover:underline disabled:opacity-50"
          data-testid="delete-course"
          aria-label={`Slett ${course.title}`}
        >
          Slett kurs
        </button>
      </div>
    </article>
  );
}
