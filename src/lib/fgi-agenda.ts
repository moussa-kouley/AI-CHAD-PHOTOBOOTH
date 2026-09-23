export const FGI_OPENING = ["Alifa Mahamat Abouna", "Dr Khouzeifi Doudbane", "Secrétariat IGF Monde"] as const;

export const FGI_DAY1_MODERATOR = "Koubra Gaby";

export const FGI_PANELS = [
  {
    n: "01",
    title: "La protection des données à l’ère de l’IA",
    people: ["Saleh Mahamat Issaka", "Mahamat Issa Abakar", "Me Frédéric Nanadjingué"],
  },
  {
    n: "02",
    title: "Les infrastructures de demain",
    people: ["Adoum Langaba Adjidei", "Brahim Abdelkhani"],
  },
  {
    n: "03",
    title: "Adapter le système éducatif à la jeunesse tchadienne à l’ère de l’IA",
    people: ["Kouley Moussa Adoum", "Dr Khouzeifi Doudbane", "Noubarassem Désiré"],
  },
  {
    n: "04",
    title: "Révolutionner la santé publique grâce à l’IA",
    people: ["Nassir Idriss Adam", "Dr Idriss Malloum"],
  },
  {
    n: "05",
    title: "Créer un écosystème d’innovation",
    people: ["Thierry Nemonguel", "Youssouf Ibrahim Djalal", "Denis Ngarndiguina"],
  },
] as const;

export const FGI_WORKSHOPS = [
  {
    name: "Ahlam Brahim",
    topic: "Algorithmes autonomes au Tchad : Construire pour répondre aux contraintes réseau",
  },
  {
    name: "Roukhaya AbdelAziz",
    topic: "Classification des terres à l’aide des images satellites",
  },
] as const;

/** Public kiosk token — guests enter here without creating an account. */
export const EVENT_PUBLIC_TOKEN = "fgi2026";

export const EVENT_TEMPLATES = [
  {
    slug: "forum",
    look: "Forum",
    title: "Forum FGI",
    topic: "Ouverture · Gouvernance",
    cover: "/themes/fgi-forum.jpg",
  },
  {
    slug: "donnees",
    look: "Stone",
    title: "Protection des données",
    topic: "Panel 1 · IA",
    cover: "/themes/fgi-cyber.jpg",
  },
  {
    slug: "reseau",
    look: "Flight",
    title: "Infrastructures",
    topic: "Panel 2 · Réseau",
    cover: "/themes/fgi-reseau.jpg",
  },
  {
    slug: "ecole",
    look: "Ridge",
    title: "Éducation",
    topic: "Panel 3 · Jeunesse",
    cover: "/themes/fgi-ecole.jpg",
  },
  {
    slug: "sante",
    look: "Clinic",
    title: "Santé publique",
    topic: "Panel 4 · IA",
    cover: "/themes/fgi-ia.jpg",
  },
  {
    slug: "innovation",
    look: "Astro",
    title: "Écosystème d’innovation",
    topic: "Panel 5",
    cover: "/themes/fgi-ia.jpg",
  },
  {
    slug: "algorithmes",
    look: "Signal",
    title: "Algorithmes autonomes",
    topic: "Atelier · Ahlam Brahim",
    cover: "/themes/fgi-reseau.jpg",
  },
  {
    slug: "satellite",
    look: "Harvest",
    title: "Terres et satellites",
    topic: "Atelier · Roukhaya AbdelAziz",
    cover: "/themes/fgi-sahel.jpg",
  },
] as const;

export function eventLookTitles() {
  return [...new Set(EVENT_TEMPLATES.map((item) => item.look))];
}

export function eventTemplateByLook(look: string) {
  const needle = look.trim().toLowerCase();
  return EVENT_TEMPLATES.find(
    (item) => item.look.toLowerCase() === needle || item.slug.toLowerCase() === needle,
  );
}

export function eventGuestPrompts() {
  return EVENT_TEMPLATES.map((item) => ({
    id: item.look,
    title: item.look,
    category: "Horizon",
  }));
}

export function eventGuestBooth() {
  return {
    id: "fgi-event",
    name: "Booth FGI Tchad",
    publicToken: EVENT_PUBLIC_TOKEN,
    videoEnabled: false,
    deliveryMode: "link",
    promptMode: "user_chooses",
    eventName: "FGI Tchad",
    subtitle: "10e édition · N’Djamena",
  };
}
