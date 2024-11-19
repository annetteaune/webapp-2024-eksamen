import { Hono } from "hono";
import db from "../../../db/db";
import {
  getTemplates,
  getTemplate,
  addTemplate,
  modifyTemplate,
  removeTemplate,
} from "../service";
import { createTemplateSchema, updateTemplateSchema } from "../helpers";

const app = new Hono();

app.get("/", async (c) => {
  const result = await getTemplates(db);

  if (!result.success) {
    return c.json({ error: result.error }, { status: 500 });
  }

  return c.json(result.data);
});

app.get("/:templateId", async (c) => {
  const templateId = c.req.param("templateId");
  const result = await getTemplate(db, templateId);

  if (!result.success) {
    return c.json(
      { error: result.error },
      { status: result.error.code === "TEMPLATE_NOT_FOUND" ? 404 : 500 }
    );
  }

  return c.json(result.data);
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createTemplateSchema.parse(body);
    const result = await addTemplate(db, validatedData);

    if (!result.success) {
      return c.json({ error: result.error }, { status: 400 });
    }
    return c.json(result.data, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        },
        { status: 400 }
      );
    }
    return c.json(
      {
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
});

app.patch("/:templateId", async (c) => {
  try {
    const templateId = c.req.param("templateId");
    const body = await c.req.json();
    const validatedData = updateTemplateSchema.parse(body);

    const result = await modifyTemplate(db, templateId, validatedData);

    if (!result.success) {
      return c.json(
        { error: result.error },
        { status: result.error.code === "TEMPLATE_NOT_FOUND" ? 404 : 400 }
      );
    }

    return c.json(result.data);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        },
        { status: 400 }
      );
    }
    return c.json(
      {
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
});

app.delete("/:templateId", async (c) => {
  try {
    const templateId = c.req.param("templateId");
    const result = await removeTemplate(db, templateId);

    if (!result.success) {
      return c.json(
        { error: result.error },
        {
          status:
            result.error.code === "TEMPLATE_NOT_FOUND"
              ? 404
              : result.error.code === "TEMPLATE_IN_USE"
              ? 409
              : 500,
        }
      );
    }
    return c.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error during template deletion:", error);
    return c.json(
      {
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
});

export default app;
