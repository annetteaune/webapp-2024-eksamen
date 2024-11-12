import { useState, useEffect } from "react";
import { fetcher } from "../api/fetcher";
import type { User } from "@/interfaces/types";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetcher("/brukere");
        if (response.success) {
          setUsers(response.data);
        } else {
          throw new Error(response.error.message);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch users")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, isLoading, error };
}
