import { courses } from "@/data/data";
import { useEffect, useState } from "react";
import {
  Course as CourseType,
  Lesson as LessonType,
} from "../interfaces/types";
import Lesson from "./Lesson";
import { User } from "../interfaces/types";
import Link from "next/link";

// hente kursdata
const getCourse = async (slug: string): Promise<CourseType | undefined> => {
  const data = await courses.filter((course) => course.slug === slug);
  return data?.[0];
};

interface CourseProps {
  courseSlug: string;
  lessonSlug?: string;
}

export default function Course({ courseSlug, lessonSlug }: CourseProps) {
  const [content, setContent] = useState<CourseType | null>(null);

  useEffect(() => {
    const getCourse = async (slug: string) => {
      const data = courses.find((course) => course.slug === slug);
      setContent(data || null);
    };

    if (courseSlug) {
      getCourse(courseSlug);
    }
  }, [courseSlug]);

  if (!content) {
    return <div>Laster inn...</div>;
  }

  return (
    <div className="grid grid-cols-[250px_minmax(20%,1fr)_1fr] gap-16">
      <aside className="border-r border-slate-200 pr-6">
        <h3 className="mb-4 text-base font-bold">Leksjoner</h3>
        <ul data-testid="lessons">
          {content.lessons?.map((lesson) => (
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
                href={`/kurs/${content.slug}/${lesson.slug}`}
              >
                {lesson.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      {lessonSlug ? (
        <article>
          <Lesson />
        </article>
      ) : (
        <section>
          <h2 className="text-2xl font-bold" data-testid="course_title">
            {content.title}
          </h2>
          <p
            className="mt-4 font-semibold leading-relaxed"
            data-testid="course_description"
          >
            {content.description}
          </p>
        </section>
      )}
      <aside
        data-testid="enrollments"
        className="border-l border-slate-200 pl-6"
      >
        <h3 className="mb-4 text-base font-bold">Kategori</h3>
        <p className="capitalize">{content.category}</p>
      </aside>
    </div>
  );
}
