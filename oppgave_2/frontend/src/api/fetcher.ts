import { ofetch } from "ofetch";
import { API_CONFIG } from "./config";

export const fetcher = ofetch.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },

  // claude.ai
  async onRequestError({ request, error }) {
    console.error(`[Request Error] ${request}:`, error);
    throw error;
  },
  async onResponseError({ request, response }) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`[Response Error] ${request}:`, errorData);
    throw new Error(errorData.error?.message || "An unexpected error occurred");
  },
});
