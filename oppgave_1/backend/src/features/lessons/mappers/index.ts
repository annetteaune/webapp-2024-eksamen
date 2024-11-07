import type { Lesson } from "@/types";

export const createLesson = (lesson: Partial<Lesson>): Lesson => {
  return {
    id: lesson.id ?? String(Math.random()),
    course_id: lesson.course_id ?? "",
    title: lesson.title ?? "",
    slug: lesson.slug ?? "",
    pre_amble: lesson.pre_amble ?? "",
    order_number: lesson.order_number ?? 0,
  };
};

export const fromDb = (lesson: any): Lesson => {
  return {
    id: lesson.id,
    course_id: lesson.course_id,
    title: lesson.title,
    slug: lesson.slug,
    pre_amble: lesson.pre_amble,
    order_number: lesson.order_number,
  };
};
