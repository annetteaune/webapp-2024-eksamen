import type { Category } from "@/types";
import type { Result } from "@/types";
import type { CategoryRepository } from "../repository";

export type CategoryService = ReturnType<typeof createCategoryService>;

export const createCategoryService = (
  categoryRepository: CategoryRepository
) => {
  const getAllCategories = async (): Promise<Result<Category[]>> => {
    return categoryRepository.findAll();
  };

  const createCategory = async (name: string): Promise<Result<Category>> => {
    return categoryRepository.create(name);
  };

  return {
    getAllCategories,
    createCategory,
  };
};
