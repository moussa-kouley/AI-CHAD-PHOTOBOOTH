import { CLEAN } from "./prompts";

export const EVENT_KINDS = ["Birthday", "Wedding", "Party", "Baby", "Grad", "Custom"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

const SCENES: Record<EventKind, string> = {
  Birthday: "A cinematic birthday setting: cake light, balloons or sparklers, warm joy. Not a catalogue.",
  Wedding: "A cinematic wedding setting: florals, dusk or candlelight, silk and hush. Not a stock chapel.",
  Party: "A cinematic party setting: night lights, music in the air, glamour. Not a generic club stock photo.",
  Baby: "A cinematic baby celebration: cream linen, soft florals, morning light. Tender, not a catalogue.",
  Grad: "A cinematic graduation portrait: hall light or open sky, pride, gold. Not a yearbook template.",
  Custom: "A cinematic event portrait built from the design note. Specific, photographed, not generic AI decor.",
};

export const KIND_INK: Record<EventKind, string> = {
  Birthday: "#e8a25a",
  Wedding: "#e8d3c4",
  Party: "#c45ad4",
  Baby: "#e8c8b8",
  Grad: "#c8a25a",
  Custom: "#c8a25a",
};

export const KIND_NOTES: Record<EventKind, string[]> = {
  Birthday: ["Grand gâteau, bougies dorées, tungstène chaud", "Ballons bijou, confettis dans l’air", "Jardin de nuit et cierges magiques"],
  Wedding: ["Roses blush, soie, heure dorée", "Salle aux chandelles, lustres", "Jardin blanc, lin, crépuscule"],
  Party: ["Boule à facettes et lumière d’argent", "Toit, nuit de ville, guirlandes", "Banquette velours, lampes ambre"],
  Baby: ["Lin crème, mobile, lumière du matin", "Floraisons blush et perles", "Lumière poudre, soie"],
  Grad: ["Toque, colonnes, lumière d’or", "Ciel ouvert, fier, vent dans le drap", "Auditorium de bois chaud"],
  Custom: ["Crépuscule de latérite, or", "Lin du désert et vent", "Lumière de studio, fond net"],
};

export const KIND_PLACE: Record<EventKind, { title: string; honoree: string; note: string }> = {
  Birthday: { title: "Amina 30", honoree: "Amina", note: "Bougies dorées, grand gâteau, tungstène chaud" },
  Wedding: { title: "Yusuf & Hawa", honoree: "Yusuf et Hawa", note: "Roses blush, soie, heure dorée" },
  Party: { title: "La nuit", honoree: "la nuit", note: "Boule à facettes, éclats d’argent, lueur de ville" },
  Baby: { title: "Petite lumière", honoree: "le bébé", note: "Lin crème, perles, lumière du matin" },
  Grad: { title: "Promo d’aujourd’hui", honoree: "le diplômé", note: "Colonnes, lumière d’or, fier" },
  Custom: { title: "Ce soir", honoree: "cette maison", note: "Crépuscule de latérite, or" },
};

function clip(value: string, max: number) {
  return value.trim().slice(0, max);
}

export function compileCustomLook(input: {
  title: string;
  kind?: string;
  honoree?: string;
  note?: string;
  color?: string;
}) {
  const kind = (EVENT_KINDS as readonly string[]).includes(input.kind || "")
    ? (input.kind as EventKind)
    : "Custom";
  const title = clip(input.title || "", 40);
  if (title.length < 2) throw new Error("Nommez le lieu");
  const honoree = clip(input.honoree || title, 60);
  const note = clip(input.note || "Goûté, photographié, propre à cette soirée.", 400);
  const color = /^#[0-9a-fA-F]{6}$/i.test(input.color || "") ? input.color!.toLowerCase() : KIND_INK[kind];

  const body = `${CLEAN} This is a ${kind.toLowerCase()} portrait. The celebration honours ${honoree}. ${SCENES[kind]} Design direction: ${note}. Accent colour ${color}. Soft decor only. Any signage is out of focus and may gently suggest "${title}" without covering faces.`;
  const videoHint = `Keep every guest large in the foreground. ${kind} atmosphere: lights and fabric move slightly, identity locked, no sharp text.`;

  return { title, category: kind, body, videoHint, color };
}
