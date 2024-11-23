import { Hono } from "hono";
import db from "../../../db/db";
import { getTypes } from "../service";

const app = new Hono();

app.get("/", async (c) => {
  const result = await getTypes(db);

  if (!result.success) {
    return c.json({ error: result.error }, { status: 500 });
  }

  return c.json(result.data);
});

export default app;
