import { useState, useEffect } from "react";
import { fetcher } from "../api/fetcher";
import type { Course } from "@/interfaces/types";

export function useCourse(slug: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!slug) return;

      try {
        const response = await fetcher(`/kurs/${slug}`);
        if (response.success) {
          setCourse(response.data);
        } else {
          throw new Error(response.error.message);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch course")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  return { course, isLoading, error };
}
