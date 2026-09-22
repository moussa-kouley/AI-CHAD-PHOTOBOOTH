export type ThemeLook = { wash: string; note: string; cover?: string; motif?: string; plate?: boolean; hint?: string };

export const THEME_LOOK: Record<string, ThemeLook> = {
  FGI: { wash: "linear-gradient(165deg,#002664 0%,#1a7ad9 48%,#050508 100%)", note: "FGI", cover: "/themes/fgi-cover.jpg", motif: "horizon", hint: "10e édition" },
  IA: { wash: "linear-gradient(165deg,#041428 0%,#0a5ad4 48%,#050508 100%)", note: "IA", cover: "/themes/fgi-ia.jpg", motif: "horizon", hint: "N’Djamena" },
  Cyber: { wash: "linear-gradient(165deg,#020814 0%,#0a3a88 50%,#c8a25a 100%)", note: "Cybersécurité", cover: "/themes/fgi-cyber.jpg", motif: "horizon", hint: "Tchad" },
  "École": { wash: "linear-gradient(165deg,#0a2048 0%,#3aa0e8 48%,#d4ae63 100%)", note: "Éducation", cover: "/themes/fgi-ecole.jpg", motif: "horizon", hint: "N’Djamena" },
  "Réseau": { wash: "linear-gradient(165deg,#001830 0%,#0a6ad8 46%,#FECB00 100%)", note: "Gouvernance", cover: "/themes/fgi-reseau.jpg", motif: "horizon", hint: "IGF" },
  Jeunesse: { wash: "linear-gradient(165deg,#002664 0%,#1a4a9a 48%,#C8102E 100%)", note: "Jeunesse", cover: "/themes/fgi-jeunesse.jpg", motif: "horizon", hint: "Place de la Nation" },
  Tchad: { wash: "linear-gradient(165deg,#002664 0%,#1a7ad9 42%,#C8102E 100%)", note: "FGI", cover: "/themes/fgi-tchad.jpg", motif: "horizon", hint: "N’Djamena" },
  Sahel: { wash: "linear-gradient(165deg,#3a2410 0%,#c88828 48%,#002664 100%)", note: "Tchad", cover: "/themes/fgi-sahel.jpg", motif: "horizon", hint: "Sahel" },
  Carpet: { wash: "linear-gradient(165deg,#2a060c 0%,#8b1d2c 42%,#d4ae63 100%)", note: "Night", motif: "night" },
  Studio: { wash: "linear-gradient(165deg,#1a1816 0%,#6d6558 48%,#002664 100%)", note: "Night", motif: "night" },
  Gala: { wash: "linear-gradient(165deg,#0c0c12 0%,#2a2340 46%,#C8102E 100%)", note: "Night", motif: "night" },
  Space: { wash: "linear-gradient(165deg,#040814 0%,#16325c 50%,#070b12 100%)", note: "Worlds", motif: "worlds" },
  Hero: { wash: "linear-gradient(165deg,#0a0610 0%,#3b1458 45%,#12080a 100%)", note: "Worlds", motif: "worlds" },
  Palace: { wash: "linear-gradient(165deg,#1a1008 0%,#7a5420 48%,#120c08 100%)", note: "Worlds", motif: "worlds" },
  Rain: { wash: "linear-gradient(165deg,#0a0612 0%,#6b1f5a 40%,#123a4a 100%)", note: "Worlds", motif: "worlds" },
  Desert: { wash: "linear-gradient(165deg,#2a1408 0%,#c46a28 50%,#1a0c08 100%)", note: "Worlds", motif: "worlds" },
  Quay: { wash: "linear-gradient(165deg,#0a1018 0%,#2a3a68 48%,#c4a06a 100%)", note: "Worlds", motif: "worlds" },
  Pulse: { wash: "linear-gradient(165deg,#1a0c08 0%,#c45a14 46%,#2a1808 100%)", note: "Worlds", motif: "worlds" },
  Marina: { wash: "linear-gradient(165deg,#0a0c12 0%,#8a6a28 50%,#141018 100%)", note: "Worlds", motif: "worlds" },
  Orbit: { wash: "linear-gradient(165deg,#002664 0%,#d4ae63 48%,#0c1018 100%)", note: "Horizon", cover: "/themes/fgi-reseau.jpg", motif: "horizon", hint: "N’Djamena" },
  Vault: { wash: "linear-gradient(165deg,#2a1810 0%,#c8b89a 50%,#1a2430 100%)", note: "Horizon", cover: "/themes/fgi-forum.jpg", motif: "horizon", hint: "Forum" },
  Arrival: { wash: "linear-gradient(165deg,#2a1008 0%,#c45a28 48%,#002664 100%)", note: "Horizon", cover: "/themes/fgi-jeunesse.jpg", motif: "horizon", hint: "Nation" },
  Forum: { wash: "linear-gradient(165deg,#002664 0%,#1a7ad9 48%,#1a140c 100%)", note: "Gouvernance", cover: "/themes/fgi-forum.jpg", motif: "horizon", hint: "FGI Tchad" },
  Dune: { wash: "linear-gradient(165deg,#3a2410 0%,#c88828 48%,#1a1408 100%)", note: "Horizon", cover: "/themes/fgi-sahel.jpg", motif: "horizon", hint: "Sahel" },
  Ridge: { wash: "linear-gradient(165deg,#2a1008 0%,#c46a38 50%,#3a2010 100%)", note: "Horizon", cover: "/themes/fgi-ecole.jpg", motif: "horizon", hint: "Éducation" },
  Court: { wash: "linear-gradient(165deg,#002664 0%,#d8c8a8 48%,#1a2430 100%)", note: "Horizon", cover: "/themes/fgi-reseau.jpg", motif: "horizon", hint: "IGF" },
  Hearth: { wash: "linear-gradient(165deg,#6a4a28 0%,#d4b07a 50%,#C8102E 100%)", note: "Horizon", cover: "/themes/fgi-tchad.jpg", motif: "horizon", hint: "Tchad" },
  Stone: { wash: "linear-gradient(165deg,#2a1008 0%,#c46a38 50%,#3a2010 100%)", note: "Horizon", cover: "/themes/fgi-cyber.jpg", motif: "horizon", hint: "Cyber" },
  Painting: { wash: "linear-gradient(165deg,#1c1208 0%,#5a3a18 50%,#120e0a 100%)", note: "Art", motif: "art" },
  Neon: { wash: "linear-gradient(165deg,#080610 0%,#b01e6c 40%,#0d4a4a 100%)", note: "Art", motif: "art" },
  Film: { wash: "linear-gradient(165deg,#1a1610 0%,#8a6a38 50%,#12100c 100%)", note: "Art", motif: "art" },
  Ice: { wash: "linear-gradient(165deg,#0a1218 0%,#6a8aa0 52%,#0c1014 100%)", note: "Art", motif: "art" },
  Cake: { wash: "linear-gradient(165deg,#3a1020 0%,#e8a25a 42%,#8a2040 100%)", note: "Birthday", motif: "birthday" },
  Balloons: { wash: "linear-gradient(165deg,#1a2048 0%,#e878a0 48%,#6a2088 100%)", note: "Birthday", motif: "birthday" },
  Confetti: { wash: "linear-gradient(165deg,#140810 0%,#c8a25a 40%,#8a1428 100%)", note: "Birthday", motif: "birthday" },
  Spark: { wash: "linear-gradient(165deg,#1a1008 0%,#f0c060 50%,#3a1808 100%)", note: "Birthday", motif: "birthday" },
  Aisle: { wash: "linear-gradient(165deg,#2a1820 0%,#e8d0c4 48%,#6a4050 100%)", note: "Wedding", motif: "wedding" },
  Bloom: { wash: "linear-gradient(165deg,#2a1814 0%,#e8c4b0 46%,#5a3040 100%)", note: "Wedding", motif: "wedding" },
  Ballroom: { wash: "linear-gradient(165deg,#1a1410 0%,#c8a868 46%,#2a2018 100%)", note: "Wedding", motif: "wedding" },
  Garden: { wash: "linear-gradient(165deg,#1a2418 0%,#c8d4b0 50%,#4a6050 100%)", note: "Wedding", motif: "wedding" },
  Disco: { wash: "linear-gradient(165deg,#080610 0%,#d4d8e8 30%,#6a2088 70%,#120818 100%)", note: "Party", motif: "party" },
  Rooftop: { wash: "linear-gradient(165deg,#081018 0%,#3a5080 48%,#c8a25a 100%)", note: "Party", motif: "party" },
  Velvet: { wash: "linear-gradient(165deg,#180810 0%,#6a1428 50%,#1a080c 100%)", note: "Party", motif: "party" },
  After: { wash: "linear-gradient(165deg,#080612 0%,#b01e6c 40%,#0d4a6a 100%)", note: "Party", motif: "party" },
  Bundle: { wash: "linear-gradient(165deg,#2a2420 0%,#f0e4d4 50%,#c8a090 100%)", note: "Baby", motif: "baby" },
  Blush: { wash: "linear-gradient(165deg,#2a1820 0%,#e8b8c8 48%,#8a5060 100%)", note: "Baby", motif: "baby" },
  Cap: { wash: "linear-gradient(165deg,#0c1428 0%,#c8a25a 48%,#12203a 100%)", note: "Grad", motif: "grad" },
  Hall: { wash: "linear-gradient(165deg,#1a140c 0%,#8a6a38 50%,#120e0a 100%)", note: "Grad", motif: "grad" },
  Astro: { wash: "linear-gradient(165deg,#040814 0%,#c8a25a 42%,#16325c 100%)", note: "Atelier", cover: "/themes/fgi-ia.jpg", motif: "atelier", plate: false, hint: "IA" },
  Lab: { wash: "linear-gradient(165deg,#141820 0%,#d8d0c4 48%,#2a3040 100%)", note: "Atelier", cover: "/themes/fgi-ecole.jpg", motif: "atelier", plate: false, hint: "Éducation" },
  Duty: { wash: "linear-gradient(165deg,#1a1408 0%,#6a7a48 48%,#2a2010 100%)", note: "Atelier", cover: "/themes/fgi-forum.jpg", motif: "atelier", plate: false, hint: "Nation" },
  Clinic: { wash: "linear-gradient(165deg,#1a2428 0%,#d4e0dc 50%,#243038 100%)", note: "Atelier", cover: "/themes/fgi-ecole.jpg", motif: "atelier", plate: false, hint: "Éducation" },
  Forge: { wash: "linear-gradient(165deg,#1a1008 0%,#c46a28 48%,#121018 100%)", note: "Atelier", cover: "/themes/fgi-sahel.jpg", motif: "atelier", plate: false, hint: "Sahel" },
  Flight: { wash: "linear-gradient(165deg,#0a1018 0%,#4a6080 48%,#c8a25a 100%)", note: "Atelier", cover: "/themes/fgi-reseau.jpg", motif: "atelier", plate: false, hint: "Réseau" },
  Signal: { wash: "linear-gradient(165deg,#0c0c12 0%,#3a3a48 50%,#1a1816 100%)", note: "Atelier", cover: "/themes/fgi-cyber.jpg", motif: "atelier", plate: false, hint: "Cyber" },
  Draft: { wash: "linear-gradient(165deg,#2a1810 0%,#c8b89a 50%,#1a2430 100%)", note: "Atelier", cover: "/themes/fgi-forum.jpg", motif: "atelier", plate: false, hint: "Forum" },
  Solar: { wash: "linear-gradient(165deg,#3a2410 0%,#c88828 48%,#1a1408 100%)", note: "Atelier", cover: "/themes/fgi-sahel.jpg", motif: "atelier", plate: false, hint: "Sahel" },
  Press: { wash: "linear-gradient(165deg,#1a0c08 0%,#c45a14 46%,#2a1808 100%)", note: "Atelier", cover: "/themes/fgi-jeunesse.jpg", motif: "atelier", plate: false, hint: "Jeunesse" },
  Bench: { wash: "linear-gradient(165deg,#0c1428 0%,#c8a25a 48%,#12203a 100%)", note: "Atelier", cover: "/themes/fgi-forum.jpg", motif: "atelier", plate: false, hint: "Gouvernance" },
  Envoy: { wash: "linear-gradient(165deg,#1a1410 0%,#8a6a38 50%,#120e0a 100%)", note: "Atelier", cover: "/themes/fgi-tchad.jpg", motif: "atelier", plate: false, hint: "Gouvernance" },
  Harvest: { wash: "linear-gradient(165deg,#2a1408 0%,#c46a28 50%,#1a0c08 100%)", note: "Atelier", cover: "/themes/fgi-sahel.jpg", motif: "atelier", plate: false, hint: "Sahel" },
  Lunettes: { wash: "linear-gradient(165deg,#08060c 0%,#3a3a48 46%,#c8a25a 100%)", note: "XR", cover: "/themes/fgi-ia.jpg", motif: "xr", plate: false, hint: "IA" },
  "Salle XR": { wash: "linear-gradient(165deg,#0a0c14 0%,#2a3a48 48%,#8ab4c8 100%)", note: "XR", cover: "/themes/fgi-forum.jpg", motif: "xr", plate: false, hint: "Forum" },
  Jeu: { wash: "linear-gradient(165deg,#141018 0%,#6a5a38 48%,#1a2430 100%)", note: "XR", cover: "/themes/fgi-jeunesse.jpg", motif: "xr", plate: false, hint: "Jeunesse" },
  Spatial: { wash: "linear-gradient(165deg,#002664 0%,#c8a25a 42%,#16325c 100%)", note: "XR", cover: "/themes/fgi-cyber.jpg", motif: "xr", plate: false, hint: "Cyber" },
  Holo: { wash: "linear-gradient(165deg,#1a1408 0%,#d4ae63 46%,#141820 100%)", note: "XR", cover: "/themes/fgi-ia.jpg", motif: "xr", plate: false, hint: "IA" },
  Visor: { wash: "linear-gradient(165deg,#2a1408 0%,#d4ae63 48%,#C8102E 100%)", note: "XR", cover: "/themes/fgi-tchad.jpg", motif: "xr", plate: false, hint: "Tchad" },
};

const OLD_TITLES: Record<string, string> = {
  "Red carpet": "Carpet",
  "Editorial studio": "Studio",
  "Met night": "Gala",
  Astronaut: "Space",
  Superhero: "Hero",
  "Royal court": "Palace",
  "Rain Tokyo": "Rain",
  Tokyo: "Rain",
  "Desert dusk": "Desert",
  "Paris river": "Quay",
  Paris: "Quay",
  "Lagos light": "Pulse",
  Lagos: "Pulse",
  "Dubai gold": "Marina",
  Dubai: "Marina",
  "N'Djamena dusk": "Orbit",
  Globe: "Orbit",
  Arch: "Vault",
  Guard: "Arrival",
  Nation: "Forum",
  "Lake Chad": "Dune",
  Camels: "Dune",
  "Ennedi stone": "Stone",
  Rocks: "Stone",
  "Zakouma sun": "Ridge",
  Hills: "Ridge",
  "Grand Marché": "Hearth",
  Village: "Hearth",
  "Chadian cloth": "Forum",
  Square: "Court",
  "Oil painting": "Painting",
  "Neon night": "Neon",
  "Vintage film": "Film",
  "Ice atelier": "Ice",
};

export const CATEGORY_ORDER = ["FGI", "IA", "Cybersécurité", "Éducation", "Gouvernance", "Jeunesse", "Atelier", "XR", "Horizon", "Chad", "Tchad", "Birthday", "Wedding", "Party", "Baby", "Grad", "Worlds", "Night", "Identity", "Art", "Custom"];

const MOTIF: Record<string, string> = {
  Birthday: "birthday",
  Wedding: "wedding",
  Party: "party",
  Baby: "baby",
  Grad: "grad",
  Atelier: "atelier",
  XR: "xr",
  Spatial: "xr",
  Horizon: "horizon",
  Chad: "horizon",
  Tchad: "horizon",
  FGI: "horizon",
  IA: "horizon",
  Cybersécurité: "horizon",
  Éducation: "horizon",
  Gouvernance: "horizon",
  Jeunesse: "horizon",
  Worlds: "worlds",
  Night: "night",
  Identity: "night",
  Art: "art",
  Custom: "custom",
};

const PALETTE: Record<string, string[]> = {
  Birthday: [
    "linear-gradient(165deg,#3a1020 0%,#e8a25a 42%,#8a2040 100%)",
    "linear-gradient(165deg,#1a2048 0%,#e878a0 48%,#6a2088 100%)",
    "linear-gradient(165deg,#140810 0%,#c8a25a 40%,#8a1428 100%)",
  ],
  Wedding: [
    "linear-gradient(165deg,#2a1820 0%,#e8d0c4 48%,#6a4050 100%)",
    "linear-gradient(165deg,#1a1410 0%,#c8a868 46%,#2a2018 100%)",
    "linear-gradient(165deg,#1a2418 0%,#c8d4b0 50%,#4a6050 100%)",
  ],
  Party: [
    "linear-gradient(165deg,#080610 0%,#d4d8e8 30%,#6a2088 100%)",
    "linear-gradient(165deg,#081018 0%,#3a5080 48%,#c8a25a 100%)",
    "linear-gradient(165deg,#180810 0%,#6a1428 50%,#1a080c 100%)",
  ],
  Baby: [
    "linear-gradient(165deg,#2a2420 0%,#f0e4d4 50%,#c8a090 100%)",
    "linear-gradient(165deg,#2a1820 0%,#e8b8c8 48%,#8a5060 100%)",
  ],
  Grad: [
    "linear-gradient(165deg,#0c1428 0%,#c8a25a 48%,#12203a 100%)",
    "linear-gradient(165deg,#1a140c 0%,#8a6a38 50%,#120e0a 100%)",
  ],
  Atelier: [
    "linear-gradient(165deg,#1a1408 0%,#c8a25a 42%,#0c1018 100%)",
    "linear-gradient(165deg,#141820 0%,#d8d0c4 48%,#2a3040 100%)",
    "linear-gradient(165deg,#1a1008 0%,#6a7a48 48%,#2a2010 100%)",
  ],
  Horizon: [
    "linear-gradient(165deg,#002664 0%,#d4ae63 46%,#1a1408 100%)",
    "linear-gradient(165deg,#2a1810 0%,#FECB00 48%,#1a2430 100%)",
    "linear-gradient(165deg,#3a2410 0%,#c88828 48%,#C8102E 100%)",
  ],
  XR: [
    "linear-gradient(165deg,#08060c 0%,#3a3a48 46%,#c8a25a 100%)",
    "linear-gradient(165deg,#002664 0%,#c8a25a 42%,#16325c 100%)",
    "linear-gradient(165deg,#141018 0%,#6a5a38 48%,#C8102E 100%)",
  ],
  Custom: [
    "linear-gradient(165deg,#141210 0%,#c8a25a 50%,#1a1410 100%)",
    "linear-gradient(165deg,#101018 0%,#6a7ab0 50%,#141018 100%)",
  ],
};

export function categoryLabel(category: string) {
  if (category === "Tchad" || category === "Chad") return "Horizon";
  if (category === "Identity") return "Night";
  if (category === "Spatial") return "XR";
  return category;
}

export function themeMotif(category: string, title?: string) {
  const known = title ? (THEME_LOOK[title] || THEME_LOOK[OLD_TITLES[title]])?.motif : undefined;
  if (known) return known;
  return MOTIF[categoryLabel(category)] || "custom";
}

export function themeLook(title: string, category?: string, accent?: string): ThemeLook {
  const named = THEME_LOOK[title] || THEME_LOOK[OLD_TITLES[title]];
  if (named) return named;
  const note = categoryLabel(category || "Custom");
  if (accent && /^#[0-9a-fA-F]{6}$/i.test(accent)) {
    return {
      wash: `linear-gradient(165deg,#120e0c 0%,${accent} 48%,#0c0a08 100%)`,
      note,
      motif: themeMotif(note),
    };
  }
  const palette = PALETTE[note] || PALETTE.Custom;
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) hash = (hash + title.charCodeAt(i) * (i + 1)) % 997;
  return { wash: palette[hash % palette.length], note, motif: themeMotif(note) };
}

export function themeRank(title: string) {
  const index = Object.keys(THEME_LOOK).indexOf(title);
  return index < 0 ? 999 : index;
}

export function accentFromBody(body?: string) {
  const match = body?.match(/Accent colour (#[0-9a-fA-F]{6})/i);
  return match?.[1];
}

export function attractCovers() {
  const order = ["IA", "Cyber", "École", "Réseau", "Forum", "Jeunesse", "Sahel", "Tchad"];
  return order
    .map((name) => [name, THEME_LOOK[name]] as const)
    .filter((row): row is readonly [string, ThemeLook] => Boolean(row[1]?.cover));
}
