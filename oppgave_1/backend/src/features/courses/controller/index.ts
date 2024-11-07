import { Hono } from "hono";
import { z } from "zod";
import { createCourseService } from "../service";
import { createCourseRepository } from "../repository";
import { createLessonService } from "../../lessons/service";
import { createLessonRepository } from "../../lessons/repository";
import db from "../../../db/db";
import { courseSchema } from "../helpers";

const courseRouter = new Hono();

const courseRepository = createCourseRepository(db);
const lessonRepository = createLessonRepository(db);
const lessonService = createLessonService(lessonRepository, courseRepository);
const courseService = createCourseService(courseRepository, lessonService);

courseRouter.get("/", async (c) => {
  const result = await courseService.getAllCourses();
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

courseRouter.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const result = await courseService.getCourse(slug);

  if (!result.success) {
    if (result.error.code === "NOT_FOUND") {
      return c.json(
        {
          success: false,
          error: { message: "Course not found" },
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

courseRouter.post("/", async (c) => {
  const body = await c.req.json();

  try {
    const validatedData = courseSchema.parse(body);
    const result = await courseService.createCourse(validatedData);

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

courseRouter.patch("/:slug/category", async (c) => {
  const slug = c.req.param("slug");
  const body = await c.req.json();

  const categorySchema = z.object({
    category: z.string().min(1),
  });

  try {
    const { category } = categorySchema.parse(body);
    const result = await courseService.updateCourseCategory(slug, category);

    if (!result.success) {
      if (result.error.code === "NOT_FOUND") {
        return c.json(
          {
            success: false,
            error: { message: "Course not found" },
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
  } catch (error) {
    if (error) {
      return c.json({ success: false, error: { message: error } }, 400);
    }
    throw error;
  }
});

courseRouter.delete("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const result = await courseService.deleteCourse(slug);

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

export { courseRouter };
