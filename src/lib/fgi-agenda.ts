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

const PERSON = "/themes/guest-person.jpg";

export const EVENT_TEMPLATES = [
  {
    slug: "forum",
    look: "Forum",
    title: "Forum",
    topic: "Place de la Nation",
    cover: "/themes/fgi-forum.jpg",
    guest: PERSON,
    portrait: "center 22%",
  },
  {
    slug: "donnees",
    look: "Stone",
    title: "Pierre",
    topic: "Grès et lumière",
    cover: "/themes/fgi-cyber.jpg",
    guest: "/themes/guest-cyber.jpg",
    portrait: "center 22%",
  },
  {
    slug: "reseau",
    look: "Flight",
    title: "Réseau",
    topic: "Fibre et ciel",
    cover: "/themes/fgi-reseau.jpg",
    guest: PERSON,
    portrait: "center 22%",
  },
  {
    slug: "ecole",
    look: "Ridge",
    title: "École",
    topic: "Crête au soleil",
    cover: "/themes/fgi-ecole.jpg",
    guest: "/themes/guest-ecole.jpg",
    portrait: "center 18%",
  },
  {
    slug: "sante",
    look: "Clinic",
    title: "Santé",
    topic: "Lumière claire",
    cover: "/themes/fgi-ia.jpg",
    guest: PERSON,
    portrait: "center 22%",
  },
  {
    slug: "innovation",
    look: "Astro",
    title: "Innovation",
    topic: "Atelier d’étoiles",
    cover: "/themes/fgi-ia.jpg",
    guest: PERSON,
    portrait: "center 22%",
  },
  {
    slug: "algorithmes",
    look: "Signal",
    title: "Signal",
    topic: "Nuit connectée",
    cover: "/themes/fgi-cyber.jpg",
    guest: "/themes/guest-cyber.jpg",
    portrait: "center 22%",
  },
  {
    slug: "satellite",
    look: "Harvest",
    title: "Sahel",
    topic: "Terres et ciel",
    cover: "/themes/fgi-sahel.jpg",
    guest: PERSON,
    portrait: "center 22%",
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
