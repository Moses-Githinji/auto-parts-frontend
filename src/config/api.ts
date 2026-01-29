import { z } from "zod";

export const environmentSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:3000"),
  VITE_NODE_ENV: z
    .enum(["development", "production", "test"])
    .optional()
    .default("development"),
});

export type Environment = z.infer<typeof environmentSchema>;

const env = environmentSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
});

export const isDevelopment =
  import.meta.env.DEV || env.VITE_NODE_ENV === "development";

export const API_CONFIG = {
  baseURL: isDevelopment
    ? "http://localhost:3000"
    : "https://motor-connect-kenya.onrender.com",
  timeout: 30000,
  env: env.VITE_NODE_ENV,
} as const;

export default API_CONFIG;
