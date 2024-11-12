import { Hono } from "hono";
import { createCommentService } from "../service";
import { createCommentRepository } from "../repository";
import db from "../../../db/db";
import { createCommentSchema } from "../helpers";

const commentRouter = new Hono();
const commentRepository = createCommentRepository(db);
const commentService = createCommentService(commentRepository);

commentRouter.get("/:lessonSlug", async (c) => {
  const lessonSlug = c.req.param("lessonSlug");
  const result = await commentService.getCommentsByLesson(lessonSlug);

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

commentRouter.post("/", async (c) => {
  const body = await c.req.json();

  try {
    const validatedData = createCommentSchema.parse(body);
    const result = await commentService.createComment(validatedData);

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
    if (error instanceof Error) {
      return c.json({ success: false, error: { message: error.message } }, 400);
    }
    throw error;
  }
});

export { commentRouter };
