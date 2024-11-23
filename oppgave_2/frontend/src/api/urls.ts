// claude.ai

const createEndpoints = (baseUrl: string) => {
  return {
    events: {
      base: `${baseUrl}/events`,
      byId: (id: string) => `${baseUrl}/events/by-id/${id}`,
      bySlug: (slug: string) => `${baseUrl}/events/${slug}`,
      filtered: (params: Record<string, string>) => {
        const queryString = new URLSearchParams(params).toString();
        return `${baseUrl}/events${queryString ? `?${queryString}` : ""}`;
      },
    },
    bookings: {
      base: `${baseUrl}/bookings`,
      bySlug: (slug: string) => `${baseUrl}/bookings/${slug}`,
      byId: (id: string) => `${baseUrl}/bookings/${id}`,
    },
    templates: {
      base: `${baseUrl}/templates`,
      byId: (id: string) => `${baseUrl}/templates/${id}`,
    },
    types: {
      base: `${baseUrl}/types`,
    },
  };
};

export type Endpoints = ReturnType<typeof createEndpoints>;

export const endpoints = createEndpoints(
  process.env.BACKEND_URL || "http://localhost:3999"
);
