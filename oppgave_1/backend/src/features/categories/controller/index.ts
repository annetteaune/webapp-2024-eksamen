import { Hono } from "hono";
import { createCategoryService } from "../service";
import { createCategoryRepository } from "../repository";
import { categorySchema } from "../helpers";
import db from "../../../db/db";

const categoryRouter = new Hono();
const categoryRepository = createCategoryRepository(db);
const categoryService = createCategoryService(categoryRepository);

categoryRouter.get("/", async (c) => {
  const result = await categoryService.getAllCategories();
  if (!result.success) {
    return c.json(
      {
        success: false,
        error: { message: result.error.message },
      },
      500
    );
  }
  return c.json({ success: true, data: result.data });
});

categoryRouter.post("/", async (c) => {
  const body = await c.req.json();

  try {
    const { name } = categorySchema.parse(body);
    const result = await categoryService.createCategory(name);

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: { message: result.error.message },
        },
        500
      );
    }

    return c.json({ success: true, data: result.data }, 201);
  } catch (error) {
    if (error) {
      return c.json({ success: false, error: { message: error } }, 400);
    }
    throw error;
  }
});

export { categoryRouter };
