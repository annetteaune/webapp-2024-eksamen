// src/app.ts (updated)
import { Hono } from "hono";
import { cors } from "hono/cors";
import { courseRouter } from "./features/courses/controller";
import { lessonRouter } from "./features/lessons/controller";

const app = new Hono();

app.use("/*", cors());

app.route("/kurs", courseRouter);
app.route("/leksjoner", lessonRouter);

app.onError((err, c) => {
  console.error(err);
  return c.json(
    {
      error: {
        message: err.message,
      },
    },
    500
  );
});

export default app;
