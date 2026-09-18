/** Instagram/Facebook feed portrait. Full frame stays inside this canvas. */
export const SOCIAL_W = 1080;
export const SOCIAL_H = 1350;
export const SOCIAL_RATIO = SOCIAL_W / SOCIAL_H;
export const SOCIAL_FILENAME = "chad-ai-portrait.jpg";
export const FILM_FILENAME = "chad-ai-film.mp4";

export function souvenirFilename(ext: string, given?: string | null) {
  const clean = (given || "").split(/[/\\]/).pop() || "";
  const safe = clean.replace(/[^\w.-]/g, "");
  const lower = safe.toLowerCase();
  const house = lower.startsWith("chad") || lower.startsWith("lumen");
  if (ext === ".mp4") return house && lower.endsWith(".mp4") ? safe : FILM_FILENAME;
  if (house && /\.jpe?g$/i.test(safe)) return safe.replace(/\.jpeg$/i, ".jpg");
  return SOCIAL_FILENAME;
}
