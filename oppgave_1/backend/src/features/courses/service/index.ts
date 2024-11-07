import type { Course } from "@/types";
import type { Result } from "@/types";
import type { CourseRepository } from "../repository";
import type { LessonService } from "../../lessons/service";

export type CourseService = ReturnType<typeof createCourseService>;

export const createCourseService = (
  courseRepository: CourseRepository,
  lessonService: LessonService
) => {
  const getAllCourses = async (): Promise<Result<Course[]>> => {
    return courseRepository.findAll();
  };

  const getCourse = async (slug: string): Promise<Result<Course>> => {
    return courseRepository.findBySlug(slug);
  };

  const createCourse = async (
    courseData: Omit<Course, "id">
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
    const result = await lessonService.deleteLessonsByCourseSlug(slug);
    if (!result.success) {
      return result;
    }
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
