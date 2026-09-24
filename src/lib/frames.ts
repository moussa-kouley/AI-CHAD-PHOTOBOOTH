export const FRAMES = [
  { id: "strip", name: "Folio", note: "Feuille de festival. Crème, trois couvertures.", paper: "#f3eee6", ink: "#1b1b1b" },
  { id: "sparkle", name: "Gala", note: "Black tie. Filet d’or, trois couvertures.", paper: "#0a0a0c", ink: "#f4efe6" },
  { id: "brand", name: "Forum", note: "Plaque de sommet. Votre encre en passe-partout.", paper: "#f6f1e8", ink: "#1b1b1b" },
  { id: "instant", name: "Plate", note: "Un cliché. Large marge ivoire.", paper: "#f7f3ea", ink: "#111111" },
  { id: "held", name: "Salon", note: "Un portrait seul, comme au mur.", paper: "#ebe6db", ink: "#1b1b1b" },
  { id: "poster", name: "Affiche FGI", note: "Affiche 10e édition. Votre photo dans le cadre.", paper: "#00205c", ink: "#ffffff" },
] as const;

export type FrameId = (typeof FRAMES)[number]["id"];

export const FRAME_ALIASES: Record<string, FrameId> = {
  cinema: "strip",
  default: "strip",
  editorial: "sparkle",
  ticket: "brand",
  modern: "brand",
  polaroid: "instant",
  gilded: "instant",
  instant: "instant",
  minimal: "held",
  night: "sparkle",
  house: "brand",
  feed: "held",
  fgi: "poster",
  poster: "poster",
  affiche: "poster",
};
