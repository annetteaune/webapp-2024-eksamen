import { type DB } from "@/db/db";
import { findAllTypes } from "../repository";
import { toTypesResponse } from "../mappers";
import { type Result } from "@/types";

export const getTypes = async (
  db: DB
): Promise<Result<{ types: { id: string; name: string }[] }>> => {
  const result = await findAllTypes(db);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: toTypesResponse(result.data),
  };
};
