import { z } from "zod";
import { FRAME_ALIASES } from "./frames";

export const brandSchema = z.object({
  frame: z.preprocess((value) => {
    const raw = String(value || "strip");
    return FRAME_ALIASES[raw] || raw;
  }, z.enum(["strip", "sparkle", "brand", "instant", "held"])).default("strip"),
  eventName: z.string().max(80).optional().default(""),
  subtitle: z.string().max(80).optional().default(""),
  signature: z.string().max(60).optional().default(""),
  showTitle: z.preprocess((value) => value === true || value === "true", z.boolean()).default(false),
  primary: z.preprocess((value) => {
    const raw = String(value || "#c8a25a").trim();
    return raw.startsWith("#") ? raw : `#${raw}`;
  }, z.string().regex(/^#[0-9a-fA-F]{6}$/)).default("#c8a25a"),
  logoDataUrl: z.string().max(8_000_000).optional().default(""),
  consentText: z.string().max(800).optional().default(""),
});

export type BrandKit = z.infer<typeof brandSchema>;

export function parseBrand(raw: string): BrandKit {
  try {
    return brandSchema.parse(JSON.parse(raw));
  } catch {
    return brandSchema.parse({});
  }
}
