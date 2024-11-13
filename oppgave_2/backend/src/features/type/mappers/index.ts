import { type Type } from "../repository";

export const toTypeResponse = (type: Type) => ({
  id: type.id,
  name: type.name,
});

export const toTypesResponse = (types: Type[]) => ({
  types: types.map(toTypeResponse),
});
