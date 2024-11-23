import { Type } from "../helpers";

export const toTypeResponse = (type: Type) => ({
  id: type.id,
  name: type.name,
});

export const toTypesResponse = (types: Type[]) => ({
  types: types.map(toTypeResponse),
});
