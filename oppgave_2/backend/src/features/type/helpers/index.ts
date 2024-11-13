import { z } from "zod";

export const typeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});
