import type { DB } from "@/db/db";
import {
  CourseRow,
  CreateCourseDTO,
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
  // har fått hjelp av claude.ai til å splitte teksten med noe annet enn komma, da outputen ble avkortet i leksjonstekstene
  const findAllLessonsForCourse = async (
    courseId: string
  ): Promise<Lesson[]> => {
    const query = db.prepare(`
      SELECT l.id, l.course_id, l.title, l.slug, l.preAmble,
             GROUP_CONCAT(lt.id, '||') as text_ids,
             GROUP_CONCAT(lt.text, '||') as texts
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
        ? lesson.text_ids.split("||").map((id: string, index: number) => ({
            id,
            text: lesson.texts.split("||")[index],
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
  // har her fått hjelp fra claude.ai til å sørge for at leksjoner blir lagret sammen med kursene når de opprettes
  const create = async (
    courseData: CreateCourseDTO
  ): Promise<Result<Course>> => {
    try {
      const courseId = String(Math.random());
      const result = db.transaction(() => {
        const courseStmt = db.prepare(`
          INSERT INTO courses (id, title, slug, description, category)
          VALUES (?, ?, ?, ?, ?)
        `);

        courseStmt.run(
          courseId,
          courseData.title,
          courseData.slug,
          courseData.description,
          courseData.category
        );

        if (courseData.lessons && courseData.lessons.length > 0) {
          const lessonStmt = db.prepare(`
            INSERT INTO lessons (id, course_id, title, slug, preAmble)
            VALUES (?, ?, ?, ?, ?)
          `);

          const textStmt = db.prepare(`
            INSERT INTO lesson_text (id, lesson_id, text)
            VALUES (?, ?, ?)
          `);

          for (const lesson of courseData.lessons) {
            const lessonId = String(Math.random());

            lessonStmt.run(
              lessonId,
              courseId,
              lesson.title,
              lesson.slug,
              lesson.preAmble
            );

            if (lesson.text && lesson.text.length > 0) {
              for (const textItem of lesson.text) {
                textStmt.run(String(Math.random()), lessonId, textItem.text);
              }
            }
          }
        }
      })();

      const courseResult = await findBySlug(courseData.slug);

      if (!courseResult.success) {
        return ResultHandler.failure(
          "Failed to create course",
          "INTERNAL_SERVER_ERROR"
        );
      }
      return ResultHandler.success(courseResult.data);
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
      // claude.ai
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

  // slette - hjelp fra claude.ai
  const remove = async (slug: string): Promise<Result<void>> => {
    try {
      const courseQuery = db.prepare("SELECT id FROM courses WHERE slug = ?");
      const course = courseQuery.get(slug) as CourseRow;

      if (course) {
        // henter alle tilknyttede leksjoner for å få tilgang til slugs - claude.ai
        const lessonsQuery = db.prepare(
          "SELECT id, slug FROM lessons WHERE course_id = ?"
        );
        const lessons = lessonsQuery.all(course.id) as {
          id: string;
          slug: string;
        }[];

        db.transaction(() => {
          // slette tilknyttede kommentarer
          const deleteComments = db.prepare(
            "DELETE FROM comments WHERE lesson_slug = ?"
          );
          lessons.forEach((lesson) => {
            deleteComments.run(lesson.slug);
          });

          // slette tilknyttede leksjonstekster
          const deleteLessonText = db.prepare(
            "DELETE FROM lesson_text WHERE lesson_id = ?"
          );
          lessons.forEach((lesson) => {
            deleteLessonText.run(lesson.id);
          });

          // slette tilknyttede leksjoner
          const deleteLessons = db.prepare(
            "DELETE FROM lessons WHERE course_id = ?"
          );
          deleteLessons.run(course.id);

          // slette selve kurset
          const deleteCourse = db.prepare("DELETE FROM courses WHERE id = ?");
          deleteCourse.run(course.id);
        })();

        return ResultHandler.success(undefined);
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
