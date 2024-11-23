import { type DB } from "@/db/db";
import { type Result } from "@/types";
import { Type, typeSchema } from "../helpers";

export const findAllTypes = async (db: DB): Promise<Result<Type[]>> => {
  try {
    const types = db.prepare("SELECT * FROM types").all();

    const validatedTypes = types.map((type) => typeSchema.parse(type));

    return {
      success: true,
      data: validatedTypes,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "TYPES_NOT_FOUND",
        message: "Could not fetch types",
      },
    };
  }
};
