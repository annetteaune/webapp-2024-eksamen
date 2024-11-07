import type { Course } from "@/types";

export const createCourse = (course: Partial<Course>): Course => {
  return {
    id: course.id ?? String(Math.random()),
    title: course.title ?? "",
    slug: course.slug ?? "",
    description: course.description ?? "",
    category: course.category ?? "",
    lessons: course.lessons ?? [],
  };
};

export const fromDb = (course: any, lessons: any[] = []): Course => {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    category: course.category,
    lessons: lessons,
  };
};
