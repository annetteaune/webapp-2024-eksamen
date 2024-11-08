import { useState, useEffect } from "react";
import { fetcher } from "../api/fetcher";
import type { Course } from "@/interfaces/types";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetcher("/kurs");
        if (response.success) {
          setCourses(response.data);
        } else {
          throw new Error(response.error.message);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch courses")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courses, isLoading, error };
}
