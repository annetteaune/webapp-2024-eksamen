import { type DB } from "@/db/db";
import {
  findAllTemplates,
  findTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../repository";
import { toTemplateResponse, toTemplatesResponse } from "../mappers";
import { type Result } from "@/types";
import { CreateTemplate, UpdateTemplate } from "../helpers";

type TemplateResponse = ReturnType<typeof toTemplateResponse>;
type TemplatesResponse = ReturnType<typeof toTemplatesResponse>;

export const getTemplates = async (
  db: DB
): Promise<Result<TemplatesResponse>> => {
  const result = await findAllTemplates(db);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: toTemplatesResponse(result.data),
  };
};

export const getTemplate = async (
  db: DB,
  templateId: string
): Promise<Result<TemplateResponse>> => {
  const result = await findTemplateById(db, templateId);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: toTemplateResponse(result.data),
  };
};

export const addTemplate = async (
  db: DB,
  template: CreateTemplate
): Promise<Result<TemplateResponse>> => {
  const result = await createTemplate(db, template);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: toTemplateResponse(result.data),
  };
};

export const modifyTemplate = async (
  db: DB,
  templateId: string,
  update: UpdateTemplate
): Promise<Result<TemplateResponse>> => {
  const result = await updateTemplate(db, templateId, update);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: toTemplateResponse(result.data),
  };
};

export const removeTemplate = async (
  db: DB,
  templateId: string
): Promise<Result<void>> => {
  return await deleteTemplate(db, templateId);
};
