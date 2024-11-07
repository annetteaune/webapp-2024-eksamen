import type { DB } from "@/db/db";
import {
  CourseRow,
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
      SELECT l.id, l.course_id, l.title, l.slug, l.preAmble,
             GROUP_CONCAT(lt.id) as text_ids,
             GROUP_CONCAT(lt.text) as texts
      FROM lessons l
      LEFT JOIN lesson_text lt ON l.id = lt.lesson_id
      WHERE l.course_id = ?
      GROUP BY l.id
    `);

    const lessons = query.all(courseId) as any[];

    return lessons.map((lesson) => ({
      id: lesson.id,
      courseId: lesson.course_id,
      title: lesson.title,
      slug: lesson.slug,
      preAmble: lesson.preAmble,
      text: lesson.text_ids
        ? lesson.text_ids.split(",").map((id: string, index: number) => ({
            id,
            text: lesson.texts.split(",")[index],
          }))
        : [],
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
          return fromDb(course, lessons);
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
      const courseExists = await exists(slug);
      if (!courseExists) {
        return ResultHandler.failure("Course not found", "NOT_FOUND");
      }

      const query = db.prepare("SELECT * FROM courses WHERE slug = ?");
      const courseData = query.get(slug) as CourseRow;

      if (!courseData) {
        return ResultHandler.failure("Course not found", "NOT_FOUND");
      }

      // henter leksjoner per kurs
      const lessons = await findAllLessonsForCourse(courseData.id);
      const courseWithLessons = fromDb(courseData, lessons);

      return ResultHandler.success(courseWithLessons);
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  // opprette kurs
  const create = async (
    course: Omit<Course, "id" | "lessons">
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
      const courseQuery = db.prepare("SELECT id FROM courses WHERE slug = ?");
      const course = courseQuery.get(slug) as CourseRow;

      if (course) {
        // sletter lesson_text-relasjon først
        const lessonsQuery = db.prepare(
          "SELECT id FROM lessons WHERE course_id = ?"
        );
        const lessons = lessonsQuery.all(course.id) as { id: string }[];

        const deleteLessonText = db.prepare(
          "DELETE FROM lesson_text WHERE lesson_id = ?"
        );
        lessons.forEach((lesson) => {
          deleteLessonText.run(lesson.id);
        });

        // sletter leksjon
        const deleteLessons = db.prepare(
          "DELETE FROM lessons WHERE course_id = ?"
        );
        deleteLessons.run(course.id);

        // sletter kurset til sist
        const deleteCourse = db.prepare("DELETE FROM courses WHERE id = ?");
        deleteCourse.run(course.id);
      }

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
