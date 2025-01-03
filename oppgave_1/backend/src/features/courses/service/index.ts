import type { Course } from "@/types";
import type { Result } from "@/types";
import type { CourseRepository } from "../repository";

export type CourseService = ReturnType<typeof createCourseService>;

export const createCourseService = (courseRepository: CourseRepository) => {
  const getAllCourses = async (): Promise<Result<Course[]>> => {
    return courseRepository.findAll();
  };

  const getCourse = async (slug: string): Promise<Result<Course>> => {
    return courseRepository.findBySlug(slug);
  };

  const createCourse = async (
    courseData: Pick<Course, "title" | "slug" | "description" | "category">
  ): Promise<Result<Course>> => {
    return courseRepository.create(courseData);
  };

  const updateCourseCategory = async (
    slug: string,
    category: string
  ): Promise<Result<Course>> => {
    return courseRepository.updateCategory(slug, category);
  };

  const deleteCourse = async (slug: string): Promise<Result<void>> => {
    return courseRepository.remove(slug);
  };

  return {
    getAllCourses,
    getCourse,
    createCourse,
    updateCourseCategory,
    deleteCourse,
  };
};
