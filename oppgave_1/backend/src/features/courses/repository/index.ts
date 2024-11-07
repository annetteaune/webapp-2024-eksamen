import type { DB } from "@/db/db";
import {
  CourseRow,
  LessonRow,
  Result,
  ResultHandler,
  type Course,
  type Lesson,
} from "../../../types";
import { fromDb } from "../mappers";

// jeg har fått hjelp til å koble sammen kurs og leksjoner fra claude.ai
export type CourseRepository = ReturnType<typeof createCourseRepository>;

export const createCourseRepository = (db: DB) => {
  const exists = async (slug: string): Promise<boolean> => {
    const query = db.prepare(
      "SELECT COUNT(*) as count FROM courses WHERE slug = ?"
    );
    const data = query.get(slug) as { count: number };
    return data.count > 0;
  };

  // hente alle leksjoner tilhørende et spesifikt kurs
  const findAllLessonsForCourse = async (
    courseId: string
  ): Promise<Lesson[]> => {
    const query = db.prepare(`
      SELECT * FROM lessons 
      WHERE course_id = ?
      ORDER BY order_number ASC
    `);
    const lessons = query.all(courseId) as LessonRow[];
    return lessons.map((lesson) => ({
      id: lesson.id,
      course_id: lesson.course_id,
      title: lesson.title,
      slug: lesson.slug,
      pre_amble: lesson.pre_amble,
      order_number: lesson.order_number,
    }));
  };

  // hente alle kurs med tilhørende leksjoner
  const findAll = async (): Promise<Result<Course[]>> => {
    try {
      const query = db.prepare("SELECT * FROM courses");
      const courses = query.all() as CourseRow[];

      const coursesWithLessons = await Promise.all(
        courses.map(async (course) => {
          const lessons = await findAllLessonsForCourse(course.id);
          return { ...fromDb(course), lessons };
        })
      );

      return ResultHandler.success(coursesWithLessons);
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  // henter kurs basert på slug
  const findBySlug = async (slug: string): Promise<Result<Course>> => {
    try {
      const course = await exists(slug);
      if (!course)
        return ResultHandler.failure("Course not found", "NOT_FOUND");

      const query = db.prepare("SELECT * FROM courses WHERE slug = ?");
      const courseData = query.get(slug) as CourseRow;

      if (!courseData) {
        return ResultHandler.failure("Course not found", "NOT_FOUND");
      }

      // henter leksjoner per kurs
      const lessons = await findAllLessonsForCourse(courseData.id);
      const courseWithLessons = { ...fromDb(courseData), lessons };

      return ResultHandler.success(courseWithLessons);
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  // opprette kurs
  const create = async (
    course: Omit<Course, "id">
  ): Promise<Result<Course>> => {
    try {
      const id = String(Math.random());
      const stmt = db.prepare(`
        INSERT INTO courses (id, title, slug, description, category)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        course.title,
        course.slug,
        course.description,
        course.category
      );
      const result = await findBySlug(course.slug);

      if (!result.success) {
        return ResultHandler.failure(
          "Failed to create course",
          "INTERNAL_SERVER_ERROR"
        );
      }

      return ResultHandler.success(result.data);
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  // oppdatere kategori
  const updateCategory = async (
    slug: string,
    category: string
  ): Promise<Result<Course>> => {
    try {
      const stmt = db.prepare(`
        UPDATE courses 
        SET category = ?
        WHERE slug = ?
      `);

      stmt.run(category, slug);
      return findBySlug(slug);
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  // slette
  const remove = async (slug: string): Promise<Result<void>> => {
    try {
      const stmt = db.prepare("DELETE FROM courses WHERE slug = ?");
      stmt.run(slug);
      return ResultHandler.success(undefined);
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  return {
    findAll,
    findBySlug,
    create,
    updateCategory,
    remove,
  };
};
