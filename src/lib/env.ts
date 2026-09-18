import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().default(""),
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

export const env = schema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  APP_URL: process.env.APP_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  DASHSCOPE_API_KEY: process.env.DASHSCOPE_API_KEY,
  DASHSCOPE_WORKSPACE_ID: process.env.DASHSCOPE_WORKSPACE_ID,
  DASHSCOPE_BASE_URL: process.env.DASHSCOPE_BASE_URL,
  WAN_IMAGE_MODEL: process.env.WAN_IMAGE_MODEL,
  WAN_VIDEO_MODEL: process.env.WAN_VIDEO_MODEL,
  RATE_LIMIT_PER_MINUTE: process.env.RATE_LIMIT_PER_MINUTE,
  CRON_SECRET: process.env.CRON_SECRET,
  NODE_ENV: process.env.NODE_ENV,
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
