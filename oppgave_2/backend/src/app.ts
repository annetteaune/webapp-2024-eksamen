import { Hono } from "hono";
import { cors } from "hono/cors";
import typeController from "../src/features/type/controller";
import bookingsController from "../src/features/bookings/controller";
import templatesController from "../src/features/templates/controller";
import eventsController from "../src/features/events/controller";

const app = new Hono();

app.use("/*", cors());

app.route("/types", typeController);
app.route("/bookings", bookingsController);
app.route("/templates", templatesController);
app.route("/events", eventsController);

app.onError((err, c) => {
  console.error(err);

  return c.json(
    {
      error: {
        message: err.message,
      },
    },
    { status: 500 }
  );
});

export default app;
