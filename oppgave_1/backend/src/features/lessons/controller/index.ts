import { Hono } from "hono";
import { createLessonService } from "../service";
import { createLessonRepository } from "../repository";
import { createCourseRepository } from "../../courses/repository";
import { lessonSchema } from "../helpers";
import db from "../../../db/db";

const lessonRouter = new Hono();

const lessonRepository = createLessonRepository(db);
const courseRepository = createCourseRepository(db);
const lessonService = createLessonService(lessonRepository, courseRepository);

// henter alle leksjoner
lessonRouter.get("/", async (c) => {
  const result = await lessonService.getAllLessons();
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

// hente basert på slug
lessonRouter.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const result = await lessonService.getLesson(slug);

  if (!result.success) {
    if (result.error.code === "NOT_FOUND") {
      return c.json(
        {
          success: false,
          error: { message: "Lesson not found" },
        },
        404
      );
    }
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

// opprette
lessonRouter.post("/", async (c) => {
  const body = await c.req.json();

  try {
    const validatedData = lessonSchema.parse(body);
    const result = await lessonService.createLesson(validatedData);

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
    return c.json(
      {
        success: false,
        error: { message: error },
      },
      400
    );
  }
});

// slette
lessonRouter.delete("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const result = await lessonService.deleteLesson(slug);

  if (!result.success) {
    return c.json(
      {
        success: false,
        error: { message: result.error.message },
      },
      500
    );
  }

  return c.json({ success: true });
});

export { lessonRouter };
