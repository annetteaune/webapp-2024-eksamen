import type { DB } from "@/db/db";
import { Result, ResultHandler, type User } from "../../../types";
import { fromDb } from "../mappers";

export type UserRepository = ReturnType<typeof createUserRepository>;

export const createUserRepository = (db: DB) => {
  const findAll = async (): Promise<Result<User[]>> => {
    try {
      const query = db.prepare("SELECT * FROM users");
      const users = query.all();
      return ResultHandler.success(users.map(fromDb));
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  const create = async (userData: Omit<User, "id">): Promise<Result<User>> => {
    try {
      const id = String(Math.random());
      const stmt = db.prepare(
        "INSERT INTO users (id, name, email) VALUES (?, ?, ?)"
      );
      stmt.run(id, userData.name, userData.email);

      const query = db.prepare("SELECT * FROM users WHERE id = ?");
      const user = query.get(id);

      if (!user) {
        return ResultHandler.failure(
          "Failed to create user",
          "INTERNAL_SERVER_ERROR"
        );
      }

      return ResultHandler.success(fromDb(user));
    } catch (error) {
      return ResultHandler.failure(error, "INTERNAL_SERVER_ERROR");
    }
  };

  return {
    findAll,
    create,
  };
};
