import type { DB } from "@/db/db";
import { Result, ResultHandler, type Category } from "../../../types";
import { fromDb } from "../mappers";

export type CategoryRepository = ReturnType<typeof createCategoryRepository>;

export const createCategoryRepository = (db: DB) => {
  const findAll = async (): Promise<Result<Category[]>> => {
    try {
      const query = db.prepare("SELECT * FROM categories");
      const categories = query.all();
      return ResultHandler.success(categories.map(fromDb));
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  const create = async (name: string): Promise<Result<Category>> => {
    try {
      const id = String(Math.random());
      const stmt = db.prepare(
        "INSERT INTO categories (id, name) VALUES (?, ?)"
      );
      stmt.run(id, name);

      const query = db.prepare("SELECT * FROM categories WHERE id = ?");
      const category = query.get(id);

      if (!category) {
        return ResultHandler.failure(
          "Failed to create category",
          "INTERNAL_SERVER_ERROR"
        );
      }

      return ResultHandler.success(fromDb(category));
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  return {
    findAll,
    create,
  };
};
