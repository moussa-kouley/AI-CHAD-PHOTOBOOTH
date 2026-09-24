import { SYSTEM_PROMPTS } from "./prompts";

export type Look = {
  title: string;
  body: string;
  videoHint: string;
};

export function resolveLooksLocal(ids: string[]): Look[] {
  const unique = [...new Set(ids.map((item) => item.trim()).filter(Boolean))];
  return unique
    .map((id) => {
      const needle = id.toLowerCase();
      return SYSTEM_PROMPTS.find((prompt) => prompt.title.toLowerCase() === needle);
    })
    .filter((prompt): prompt is (typeof SYSTEM_PROMPTS)[number] => Boolean(prompt))
    .map((prompt) => ({
      title: prompt.title,
      body: prompt.body,
      videoHint: prompt.videoHint,
    }));
}
