// src/config/api.ts
import { z } from "zod";

export const environmentSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional(),
  VITE_NODE_ENV: z.enum(["development", "production", "test"]).optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

const rawEnv = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
};

const env = environmentSchema.parse(rawEnv);

// More reliable prod check (Vite sets these automatically in builds)
const isProd = import.meta.env.PROD || env.VITE_NODE_ENV === "production";

export const API_CONFIG = {
  baseURL: isProd
    ? (env.VITE_API_BASE_URL ?? "https://motor-connect-kenya.onrender.com")
    : "http://localhost:3000",
  timeout: 30000,
  env: env.VITE_NODE_ENV ?? (isProd ? "production" : "development"),
} as const;

export default API_CONFIG;
