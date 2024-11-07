import type { DB } from "@/db/db";
import { fromDb } from "../mappers";
import {
  Lesson,
  LessonRow,
  LessonText,
  Result,
  ResultHandler,
} from "../../../types";

export type LessonRepository = ReturnType<typeof createLessonRepository>;

export const createLessonRepository = (db: DB) => {
  const exists = async (slug: string): Promise<boolean> => {
    const query = db.prepare(
      "SELECT COUNT(*) as count FROM lessons WHERE slug = ?"
    );
    const data = query.get(slug) as { count: number };
    return data.count > 0;
  };

  const getLessonTexts = async (lessonId: string): Promise<LessonText[]> => {
    const query = db.prepare(
      "SELECT id, text FROM lesson_text WHERE lesson_id = ?"
    );
    return query.all(lessonId) as LessonText[];
  };

  const findAll = async (): Promise<Result<Lesson[]>> => {
    try {
      const query = db.prepare("SELECT * FROM lessons");
      const lessons = query.all() as LessonRow[];

      const lessonsWithText = await Promise.all(
        lessons.map(async (lesson) => {
          const texts = await getLessonTexts(lesson.id);
          return fromDb(lesson, texts);
        })
      );

      return ResultHandler.success(lessonsWithText);
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };
  const findBySlug = async (slug: string): Promise<Result<Lesson>> => {
    try {
      const lessonExists = await exists(slug);
      if (!lessonExists) {
        return ResultHandler.failure("Lesson not found", "NOT_FOUND");
      }

      const query = db.prepare("SELECT * FROM lessons WHERE slug = ?");
      const lesson = query.get(slug) as LessonRow;

      if (!lesson) {
        return ResultHandler.failure("Lesson not found", "NOT_FOUND");
      }

      const texts = await getLessonTexts(lesson.id);
      return ResultHandler.success(fromDb(lesson, texts));
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  const findByCourseId = async (
    courseId: string
  ): Promise<Result<Lesson[]>> => {
    try {
      const query = db.prepare("SELECT * FROM lessons WHERE course_id = ?");
      const lessons = query.all(courseId) as LessonRow[];

      const lessonsWithText = await Promise.all(
        lessons.map(async (lesson) => {
          const texts = await getLessonTexts(lesson.id);
          return fromDb(lesson, texts);
        })
      );

      return ResultHandler.success(lessonsWithText);
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  const create = async (
    lesson: Omit<Lesson, "id">
  ): Promise<Result<Lesson>> => {
    try {
      const id = String(Math.random());

      const stmt = db.prepare(`
        INSERT INTO lessons (id, course_id, title, slug, preAmble)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(id, lesson.courseId, lesson.title, lesson.slug, lesson.preAmble);

      if (lesson.text && lesson.text.length > 0) {
        const insertText = db.prepare(`
          INSERT INTO lesson_text (id, lesson_id, text)
          VALUES (?, ?, ?)
        `);

        for (const text of lesson.text) {
          insertText.run(String(Math.random()), id, text.text);
        }
      }

      const result = await findBySlug(lesson.slug);
      if (!result.success) {
        return ResultHandler.failure(
          "Failed to create lesson",
          "INTERNAL_SERVER_ERROR"
        );
      }

      return ResultHandler.success(result.data);
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  const remove = async (slug: string): Promise<Result<void>> => {
    try {
      const lessonQuery = db.prepare("SELECT id FROM lessons WHERE slug = ?");
      const lesson = lessonQuery.get(slug) as { id: string };

      if (lesson) {
        const deleteTexts = db.prepare(
          "DELETE FROM lesson_text WHERE lesson_id = ?"
        );
        deleteTexts.run(lesson.id);

        const deleteLesson = db.prepare("DELETE FROM lessons WHERE id = ?");
        deleteLesson.run(lesson.id);
      }

      return ResultHandler.success(undefined);
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  const removeByCourseId = async (courseId: string): Promise<Result<void>> => {
    try {
      const lessonsQuery = db.prepare(
        "SELECT id FROM lessons WHERE course_id = ?"
      );
      const lessons = lessonsQuery.all(courseId) as { id: string }[];

      const deleteTexts = db.prepare(
        "DELETE FROM lesson_text WHERE lesson_id = ?"
      );
      lessons.forEach((lesson) => {
        deleteTexts.run(lesson.id);
      });

      const deleteLessons = db.prepare(
        "DELETE FROM lessons WHERE course_id = ?"
      );
      deleteLessons.run(courseId);

      return ResultHandler.success(undefined);
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  return {
    findAll,
    findBySlug,
    findByCourseId,
    create,
    remove,
    removeByCourseId,
  };
};
