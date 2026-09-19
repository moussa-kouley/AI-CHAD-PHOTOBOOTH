import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  APP_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(32),
  DASHSCOPE_API_KEY: z.string().optional().default(""),
  DASHSCOPE_WORKSPACE_ID: z.string().optional().default(""),
  DASHSCOPE_BASE_URL: z.string().optional().default(""),
  WAN_IMAGE_MODEL: z.string().default("wan2.7-image"),
  WAN_VIDEO_MODEL: z.string().default("wan2.7-i2v"),
  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(30),
  CRON_SECRET: z.string().optional().default(""),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof schema>;

function blank(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function isProductionBuild() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.VERCEL === "1" && process.env.CI === "1")
  );
}

function loadEnv(): Env {
  const databaseUrl = blank(process.env.DATABASE_URL);
  const building = isProductionBuild();

  return schema.parse({
    DATABASE_URL:
      databaseUrl ||
      (building ? "postgresql://build:build@127.0.0.1:5432/build" : databaseUrl),
    DIRECT_URL: blank(process.env.DIRECT_URL) || databaseUrl,
    NEXT_PUBLIC_SUPABASE_URL: blank(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: blank(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    SUPABASE_SERVICE_ROLE_KEY: blank(process.env.SUPABASE_SERVICE_ROLE_KEY),
    APP_URL: blank(process.env.APP_URL) || (building ? "https://build.local" : undefined),
    AUTH_SECRET:
      blank(process.env.AUTH_SECRET) ||
      (building ? "vercel-build-placeholder-secret-32ch" : undefined),
    DASHSCOPE_API_KEY: blank(process.env.DASHSCOPE_API_KEY),
    DASHSCOPE_WORKSPACE_ID: blank(process.env.DASHSCOPE_WORKSPACE_ID),
    DASHSCOPE_BASE_URL: blank(process.env.DASHSCOPE_BASE_URL),
    WAN_IMAGE_MODEL: blank(process.env.WAN_IMAGE_MODEL),
    WAN_VIDEO_MODEL: blank(process.env.WAN_VIDEO_MODEL),
    RATE_LIMIT_PER_MINUTE: blank(process.env.RATE_LIMIT_PER_MINUTE),
    CRON_SECRET: blank(process.env.CRON_SECRET),
    NODE_ENV: blank(process.env.NODE_ENV),
  });
}

let cached: Env | undefined;

export function getEnv() {
  if (!cached) cached = loadEnv();
  return cached;
}

export const env: Env = new Proxy({} as Env, {
  get(_target, prop) {
    return getEnv()[prop as keyof Env];
  },
});

export function dashscopeBaseUrl() {
  if (env.DASHSCOPE_BASE_URL) return env.DASHSCOPE_BASE_URL.replace(/\/$/, "");
  if (env.DASHSCOPE_WORKSPACE_ID) {
    return `https://${env.DASHSCOPE_WORKSPACE_ID}.ap-southeast-1.maas.aliyuncs.com/api/v1`;
  }
  return "https://dashscope-intl.aliyuncs.com/api/v1";
}

export function hasAlibabaCredentials() {
  return Boolean(env.DASHSCOPE_API_KEY);
}
