"use client";
import { fetcher } from "@/api/fetcher";
import { endpoints } from "@/api/urls";
import { useEffect, useState } from "react";

export function useTypes() {
  const [types, setTypes] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setIsLoading(true);
        const response = await fetcher<TypesResponse>(endpoints.types.base);
        setTypes(response.types);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch types")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTypes();
  }, []);

  return { types, isLoading, error };
}
