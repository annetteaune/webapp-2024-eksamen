import type { Category } from "@/types";

export const createCategory = (category: Partial<Category>): Category => {
  return {
    id: category.id ?? String(Math.random()),
    name: category.name ?? "",
  };
};

export const fromDb = (category: any): Category => {
  return {
    id: category.id,
    name: category.name,
  };
};
