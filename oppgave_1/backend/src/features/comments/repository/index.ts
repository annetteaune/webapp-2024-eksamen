import type { DB } from "@/db/db";
import { Result, ResultHandler, type Comment } from "../../../types";

export type CommentRepository = ReturnType<typeof createCommentRepository>;

export const createCommentRepository = (db: DB) => {
  const findByLessonSlug = async (
    lessonSlug: string
  ): Promise<Result<Comment[]>> => {
    try {
      const query = db.prepare(`
        SELECT 
          c.id,
          c.comment,
          c.created_by_id,
          c.created_by_name,
          c.lesson_slug,
          c.created_at
        FROM comments c
        WHERE c.lesson_slug = ?
        ORDER BY c.created_at DESC
      `);

      const comments = query.all(lessonSlug);

      return ResultHandler.success(
        comments.map((comment: any) => ({
          id: comment.id,
          createdBy: {
            id: comment.created_by_id,
            name: comment.created_by_name,
          },
          comment: comment.comment,
          lesson: {
            slug: comment.lesson_slug,
          },
          createdAt: comment.created_at,
        }))
      );
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  const create = async (data: {
    comment: string;
    createdById: string;
    createdByName: string;
    lessonSlug: string;
  }): Promise<Result<Comment>> => {
    try {
      const id = String(Math.random());
      const createdAt = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO comments (
          id,
          comment,
          created_by_id,
          created_by_name,
          lesson_slug,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        data.comment,
        data.createdById,
        data.createdByName,
        data.lessonSlug,
        createdAt
      );

      return ResultHandler.success({
        id,
        createdBy: {
          id: data.createdById,
          name: data.createdByName,
        },
        comment: data.comment,
        lesson: {
          slug: data.lessonSlug,
        },
        createdAt,
      });
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  return {
    findByLessonSlug,
    create,
  };
};
