import { useState, useEffect } from "react";
import { fetcher } from "../api/fetcher";
import type { Comment } from "@/interfaces/types";

export function useComments(lessonSlug: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      if (!lessonSlug) return;

      try {
        const response = await fetcher(`/kommentarer/${lessonSlug}`);
        if (response.success) {
          setComments(response.data);
        } else {
          throw new Error(response.error.message);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch comments")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [lessonSlug]);

  const addComment = async (newComment: {
    comment: string;
    createdById: string;
    createdByName: string;
    lessonSlug: string;
  }) => {
    try {
      const response = await fetcher("/kommentarer", {
        method: "POST",
        body: JSON.stringify(newComment),
      });

      if (response.success) {
        setComments((prev) => [response.data, ...prev]);
        return response.data;
      } else {
        throw new Error(response.error.message);
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to add comment");
    }
  };

  return { comments, isLoading, error, addComment };
}
