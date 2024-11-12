import type { User } from "@/types";

export const createUser = (user: Partial<User>): User => {
  return {
    id: user.id ?? String(Math.random()),
    name: user.name ?? "",
    email: user.email ?? "",
  };
};

export const fromDb = (user: any): User => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};
