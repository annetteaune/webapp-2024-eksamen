import { courses } from "@/data/data";
import { useEffect, useState } from "react";
import {
  Course as CourseType,
  Lesson as LessonType,
} from "../interfaces/types";
import Lesson from "./Lesson";
import { User } from "../interfaces/types";

// hente kursdata
const getCourse = async (slug: string): Promise<CourseType | undefined> => {
  const data = await courses.filter((course) => course.slug === slug);
  return data?.[0];
};

interface CourseProps {
  users?: User[]; // TODO optional siden jeg ikke helt har koll på denne
}

export default function Course({ users }: CourseProps) {
  const [content, setContent] = useState<CourseType | null>(null);

  // TODO bytte ut med params?
  const courseSlug = "javascript-101";
  const lessonSlug = "variabler";

  useEffect(() => {
    const getContent = async () => {
      const data = await getCourse(courseSlug);
      setContent(data || null);
    };
    getContent();
  }, [courseSlug]);

  return (
    <div className="grid grid-cols-[250px_minmax(20%,1fr)_1fr] gap-16">
      <aside className="border-r border-slate-200 pr-6">
        <h3 className="mb-4 text-base font-bold">Leksjoner</h3>
        <ul data-testid="lessons">
          {content?.lessons?.map((lesson) => (
            <li
              className={`text-sm" mb-4 w-full max-w-[95%] rounded-lg border border-slate-300 px-4 py-2 ${
                lessonSlug === lesson.slug ? "bg-emerald-300" : "bg-transparent"
              }`}
              key={lesson.id}
            >
              <a
                data-testid="lesson_url"
                data-slug={lessonSlug}
                className="block h-full w-full"
                href={`/kurs/${content?.slug}/${lesson.slug}`}
              >
                {lesson.title}
              </a>
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
          <>
            <h2 className="text-2xl font-bold" data-testid="course_title">
              {content?.title}
            </h2>
            <p
              className="mt-4 font-semibold leading-relaxed"
              data-testid="course_description"
            >
              {content?.description}
            </p>
          </>
        </section>
      )}
      <aside
        data-testid="enrollments"
        className="border-l border-slate-200 pl-6"
      >
        <h3 className="mb-4 text-base font-bold">Deltakere</h3>
        <ul data-testid="course_enrollments">
          {users?.map((user) => (
            <li className="mb-1" key={user.id}>
              {user.name}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
