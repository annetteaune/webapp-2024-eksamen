import { type DB } from "../../../db/db";
import { type Result } from "../../../types";
import { generateUUID } from "../../../lib/uuid";
import {
  CreateTemplate,
  DbTemplate,
  Template,
  templateSchema,
  UpdateTemplate,
} from "../helpers";

export const findAllTemplates = async (db: DB): Promise<Result<Template[]>> => {
  try {
    const templates = db
      .prepare("SELECT * FROM templates")
      .all() as DbTemplate[];

    const validatedTemplates = templates.map((template) =>
      templateSchema.parse({
        ...template,
        allowed_days: JSON.parse(template.allowed_days),
        is_private: Boolean(template.is_private),
        allow_waitlist: Boolean(template.allow_waitlist),
        allow_same_day: Boolean(template.allow_same_day),
        fixed_price: Boolean(template.fixed_price),
      })
    );

    return {
      success: true,
      data: validatedTemplates,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "TEMPLATES_NOT_FOUND",
        message: "Could not fetch templates",
      },
    };
  }
};

export const findTemplateById = async (
  db: DB,
  templateId: string
): Promise<Result<Template>> => {
  try {
    const template = db
      .prepare("SELECT * FROM templates WHERE id = ?")
      .get(templateId) as DbTemplate | undefined;

    if (!template) {
      return {
        success: false,
        error: {
          code: "TEMPLATE_NOT_FOUND",
          message: `Malen ${templateId} kunne ikke finnes`,
        },
      };
    }

    const validatedTemplate = templateSchema.parse({
      ...template,
      allowed_days: JSON.parse(template.allowed_days),
      is_private: Boolean(template.is_private),
      allow_waitlist: Boolean(template.allow_waitlist),
      allow_same_day: Boolean(template.allow_same_day),
      fixed_price: Boolean(template.fixed_price),
    });

    return {
      success: true,
      data: validatedTemplate,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "TEMPLATE_FETCH_FAILED",
        message: `Kunne ikke hente malen ${templateId}`,
      },
    };
  }
};

export const createTemplate = async (
  db: DB,
  template: CreateTemplate
): Promise<Result<Template>> => {
  try {
    const id = generateUUID();
    const created_at = new Date().toISOString();
    const newTemplate = templateSchema.parse({
      id,
      ...template,
      created_at,
    });

    db.prepare(
      `
      INSERT INTO templates (
        id, name, allowed_days, max_capacity, price,
        is_private, allow_waitlist, allow_same_day, fixed_price, created_at, type_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      newTemplate.id,
      newTemplate.name,
      JSON.stringify(newTemplate.allowed_days),
      newTemplate.max_capacity,
      newTemplate.price,
      newTemplate.is_private ? 1 : 0,
      newTemplate.allow_waitlist ? 1 : 0,
      newTemplate.allow_same_day ? 1 : 0,
      newTemplate.fixed_price ? 1 : 0,
      newTemplate.created_at,
      newTemplate.type_id
    );

    return {
      success: true,
      data: newTemplate,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "TEMPLATE_CREATE_FAILED",
        message: "Kunne ikke opprette mal.",
      },
    };
  }
};

export const updateTemplate = async (
  db: DB,
  templateId: string,
  update: UpdateTemplate
): Promise<Result<Template>> => {
  try {
    const existingResult = await findTemplateById(db, templateId);
    if (!existingResult.success) {
      return existingResult;
    }

    const updatedTemplate = templateSchema.parse({
      ...existingResult.data,
      ...update,
    });

    db.prepare(
      `
      UPDATE templates 
      SET name = ?, allowed_days = ?, max_capacity = ?, price = ?,
          is_private = ?, allow_waitlist = ?, allow_same_day = ?, 
          fixed_price = ?, type_id = ?
      WHERE id = ?
    `
    ).run(
      updatedTemplate.name,
      JSON.stringify(updatedTemplate.allowed_days),
      updatedTemplate.max_capacity,
      updatedTemplate.price,
      updatedTemplate.is_private ? 1 : 0,
      updatedTemplate.allow_waitlist ? 1 : 0,
      updatedTemplate.allow_same_day ? 1 : 0,
      updatedTemplate.fixed_price ? 1 : 0,
      updatedTemplate.type_id,
      templateId
    );

    return {
      success: true,
      data: updatedTemplate,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "TEMPLATE_UPDATE_FAILED",
        message: `Kunne ikke oppdatere ${templateId}`,
      },
    };
  }
};

// fått hjelp av claude.ai
export const deleteTemplate = async (
  db: DB,
  templateId: string
): Promise<Result<void>> => {
  try {
    const events = db
      .prepare("SELECT COUNT(*) as count FROM events WHERE template_id = ?")
      .get(templateId) as { count: number };

    if (events.count > 0) {
      return {
        success: false,
        error: {
          code: "TEMPLATE_IN_USE",
          message: "Kan ikke slette maler som er i bruk.",
        },
      };
    }

    const result = db
      .prepare("DELETE FROM templates WHERE id = ?")
      .run(templateId);

    if (result.changes === 0) {
      return {
        success: false,
        error: {
          code: "TEMPLATE_NOT_FOUND",
          message: `Malen ${templateId} kan ikke finnes.`,
        },
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "TEMPLATE_DELETE_FAILED",
        message: `Kunne ikke slette malen ${templateId}`,
      },
    };
  }
};
