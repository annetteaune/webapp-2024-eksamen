import { ofetch } from "ofetch";
import { BASE_URL } from "./config";

export const fetcher = ofetch.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
