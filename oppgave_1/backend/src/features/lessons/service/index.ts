import { Result, ResultHandler, type Lesson } from "../../../types";

import type { LessonRepository } from "../repository";
import type { CourseRepository } from "../../courses/repository";

export type LessonService = ReturnType<typeof createLessonService>;

export const createLessonService = (
  lessonRepository: LessonRepository,
  courseRepository: CourseRepository
) => {
  const getAllLessons = async (): Promise<Result<Lesson[]>> => {
    return lessonRepository.findAll();
  };

  const getLesson = async (slug: string): Promise<Result<Lesson>> => {
    return lessonRepository.findBySlug(slug);
  };

  const getLessonsByCourse = async (
    courseSlug: string
  ): Promise<Result<Lesson[]>> => {
    const courseResult = await courseRepository.findBySlug(courseSlug);
    if (!courseResult.success) {
      return ResultHandler.failure("Course not found", "NOT_FOUND");
    }

    return lessonRepository.findByCourseId(courseResult.data.id);
  };

  const createLesson = async (
    lessonData: Omit<Lesson, "id">
  ): Promise<Result<Lesson>> => {
    return lessonRepository.create(lessonData);
  };

  const deleteLesson = async (slug: string): Promise<Result<void>> => {
    return lessonRepository.remove(slug);
  };

  const deleteLessonsByCourseSlug = async (
    courseSlug: string
  ): Promise<Result<void>> => {
    const courseResult = await courseRepository.findBySlug(courseSlug);
    if (!courseResult.success) {
      return ResultHandler.failure("Course not found", "NOT_FOUND");
    }

    return lessonRepository.removeByCourseId(courseResult.data.id);
  };

  return {
    getAllLessons,
    getLesson,
    getLessonsByCourse,
    createLesson,
    deleteLesson,
    deleteLessonsByCourseSlug,
  };
};
