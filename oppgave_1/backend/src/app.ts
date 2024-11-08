import { Hono } from "hono";
import { cors } from "hono/cors";
import { courseRouter } from "./features/courses/controller";
import { categoryRouter } from "./features/categories/controller";
import { userRouter } from "./features/users/controller";

const app = new Hono();

app.use("/*", cors());

app.route("/kurs", courseRouter);
app.route("/kategorier", categoryRouter);
app.route("/brukere", userRouter);

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
