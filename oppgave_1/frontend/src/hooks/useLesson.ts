import { useState, useEffect } from "react";
import { fetcher } from "../api/fetcher";
import type { Course, Lesson } from "@/interfaces/types";

export function useLesson(courseSlug: string, lessonSlug: string) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseSlug || !lessonSlug) return;

      try {
        const response = await fetcher(`/kurs/${courseSlug}`);
        if (response.success) {
          setCourse(response.data);
          const foundLesson = response.data.lessons.find(
            (l: Lesson) => l.slug === lessonSlug
          );
          if (foundLesson) {
            setLesson(foundLesson);
          } else {
            throw new Error("Lesson not found");
          }
        } else {
          throw new Error(response.error.message);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch lesson")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseSlug, lessonSlug]);

  return { lesson, course, isLoading, error };
}
