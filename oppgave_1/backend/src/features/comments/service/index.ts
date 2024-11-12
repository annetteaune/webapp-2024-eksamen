import type { Comment, Result } from "@/types";
import type { CommentRepository } from "../repository";

export type CommentService = ReturnType<typeof createCommentService>;

export const createCommentService = (commentRepository: CommentRepository) => {
  const getCommentsByLesson = async (
    lessonSlug: string
  ): Promise<Result<Comment[]>> => {
    return commentRepository.findByLessonSlug(lessonSlug);
  };

  const createComment = async (data: {
    comment: string;
    createdById: string;
    createdByName: string;
    lessonSlug: string;
  }): Promise<Result<Comment>> => {
    return commentRepository.create(data);
  };

  return {
    getCommentsByLesson,
    createComment,
  };
};
