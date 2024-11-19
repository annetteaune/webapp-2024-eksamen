export const API_CONFIG = {
  BASE_URL: process.env.BACKEND_URL || "http://localhost:3999",
  ENDPOINTS: {
    EVENTS: "/events",
    TYPES: "/types",
    TEMPLATES: "/templates",
    BOOKINGS: "/bookings",
  },
};
