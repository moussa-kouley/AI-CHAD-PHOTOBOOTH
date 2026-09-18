import { z } from "zod";
import { brandSchema } from "./brand-schema";
import { apiCopy } from "./studio-copy";

export const registerSchema = z.object({
  name: z.string().min(2, apiCopy.twoLetters).max(60),
  email: z.string().email(apiCopy.invalidEmail).max(120),
  password: z.string().min(8, apiCopy.eightChars).max(72),
  workspaceName: z.string().min(2, apiCopy.twoLetters).max(60),
});

export const loginSchema = z.object({
  email: z.string().email(apiCopy.invalidEmail),
  password: z.string().min(1, apiCopy.twoLetters),
});

export const boothSchema = z.object({
  name: z.string().min(2, apiCopy.twoLetters).max(60),
  workflow: z.enum(["live_edit", "style_transfer"]).default("live_edit"),
  aspectRatio: z.enum(["9:16", "1:1", "4:5", "4:3"]).default("9:16"),
  promptMode: z.enum(["automatic", "user_chooses"]).default("user_chooses"),
  selectedPrompts: z.array(z.string()).max(80).default([]),
  deliveryMode: z.enum(["download", "email"]).default("download"),
  videoEnabled: z.boolean().default(true),
  isActive: z.boolean().default(true),
  brand: brandSchema,
});

export const guestSessionSchema = z.object({
  boothToken: z.string().min(8),
  promptId: z.string().optional(),
  promptIds: z.array(z.string().min(1)).min(1).max(3).optional(),
  wantVideo: z.boolean().default(false),
  consent: z.literal(true),
  email: z.string().email(apiCopy.invalidEmail).optional().or(z.literal("")),
  offlineId: z.string().min(8).max(80).optional(),
}).refine((value) => Boolean(value.promptId || value.promptIds?.length), {
  message: apiCopy.pickTheme,
});
