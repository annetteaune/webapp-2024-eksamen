import type { DB } from "@/db/db";

import { fromDb } from "../mappers";
import { Lesson, Result, ResultHandler } from "../../../types";

export type LessonRepository = ReturnType<typeof createLessonRepository>;

export const createLessonRepository = (db: DB) => {
  const exists = async (slug: string): Promise<boolean> => {
    const query = db.prepare(
      "SELECT COUNT(*) as count FROM lessons WHERE slug = ?"
    );
    const data = query.get(slug) as { count: number };
    return data.count > 0;
  };

  const findAll = async (): Promise<Result<Lesson[]>> => {
    try {
      const query = db.prepare("SELECT * FROM lessons");
      const data = query.all();
      return ResultHandler.success(data.map(fromDb));
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  const findBySlug = async (slug: string): Promise<Result<Lesson>> => {
    try {
      const lesson = await exists(slug);
      if (!lesson)
        return ResultHandler.failure("Lesson not found", "NOT_FOUND");

      const query = db.prepare("SELECT * FROM lessons WHERE slug = ?");
      const data = query.get(slug);
      return ResultHandler.success(fromDb(data));
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  const findByCourseId = async (
    courseId: string
  ): Promise<Result<Lesson[]>> => {
    try {
      const query = db.prepare("SELECT * FROM lessons WHERE course_id = ?");
      const data = query.all(courseId);
      return ResultHandler.success(data.map(fromDb));
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
        INSERT INTO lessons (id, course_id, title, slug, pre_amble, order_number)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        lesson.course_id,
        lesson.title,
        lesson.slug,
        lesson.pre_amble,
        lesson.order_number
      );

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

  const removeByCourseId = async (courseId: string): Promise<Result<void>> => {
    try {
      const stmt = db.prepare("DELETE FROM lessons WHERE course_id = ?");
      stmt.run(courseId);
      return ResultHandler.success(undefined);
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  const remove = async (slug: string): Promise<Result<void>> => {
    try {
      const stmt = db.prepare("DELETE FROM lessons WHERE slug = ?");
      stmt.run(slug);
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
    removeByCourseId,
    remove,
  };
};
