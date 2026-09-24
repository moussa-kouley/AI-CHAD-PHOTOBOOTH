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
    title: "Forum",
    topic: "Place de la Nation",
    cover: "/themes/forum.webp",
    guest: "/themes/forum.webp",
    portrait: "center 40%",
  },
  {
    slug: "donnees",
    look: "Stone",
    title: "Pierre",
    topic: "Grès et lumière",
    cover: "/themes/stone.webp",
    guest: "/themes/stone.webp",
    portrait: "center 45%",
  },
  {
    slug: "reseau",
    look: "Flight",
    title: "Réseau",
    topic: "Fibre et ciel",
    cover: "/themes/flight.webp",
    guest: "/themes/flight.webp",
    portrait: "center 18%",
  },
  {
    slug: "ecole",
    look: "Ridge",
    title: "École",
    topic: "Crête au soleil",
    cover: "/themes/ridge.webp",
    guest: "/themes/ridge.webp",
    portrait: "center 42%",
  },
  {
    slug: "sante",
    look: "Clinic",
    title: "Santé",
    topic: "Lumière claire",
    cover: "/themes/clinic.webp",
    guest: "/themes/clinic.webp",
    portrait: "center 16%",
  },
  {
    slug: "innovation",
    look: "Astro",
    title: "Innovation",
    topic: "Atelier d’étoiles",
    cover: "/themes/astro.webp",
    guest: "/themes/astro.webp",
    portrait: "center 16%",
  },
  {
    slug: "algorithmes",
    look: "Signal",
    title: "Signal",
    topic: "Nuit connectée",
    cover: "/themes/signal.webp",
    guest: "/themes/signal.webp",
    portrait: "center 16%",
  },
  {
    slug: "satellite",
    look: "Harvest",
    title: "Sahel",
    topic: "Terres et ciel",
    cover: "/themes/harvest.webp",
    guest: "/themes/harvest.webp",
    portrait: "center 16%",
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
