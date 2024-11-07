import type { Lesson, LessonText } from "@/types";

// her har jeg fått hjelp av claude.ai
export const createLesson = (lesson: Partial<Lesson>): Lesson => {
  return {
    id: lesson.id ?? String(Math.random()),
    courseId: lesson.courseId ?? "",
    title: lesson.title ?? "",
    slug: lesson.slug ?? "",
    preAmble: lesson.preAmble ?? "",
    text: lesson.text ?? [],
  };
};

export const fromDb = (lesson: any, texts: LessonText[] = []): Lesson => {
  return {
    id: lesson.id,
    courseId: lesson.course_id,
    title: lesson.title,
    slug: lesson.slug,
    preAmble: lesson.preAmble,
    text: texts,
  };
};
