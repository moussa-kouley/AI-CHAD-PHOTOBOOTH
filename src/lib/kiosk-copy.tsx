export const copy = {
  touch: { en: "Touch to start", fr: "Touchez pour commencer" },
  keepFace: { en: "We keep your face.", fr: "Nous gardons votre visage." },
  changePlace: { en: "We change the clothes or the place.", fr: "Nous changeons les vêtements ou le lieu." },
  consent: {
    en: "One photo, to make your portraits.",
    fr: "Une photo, pour créer vos portraits.",
  },
  enter: { en: "Step in", fr: "Entrez" },
  back: { en: "Back", fr: "Retour" },
  head: { en: "Everyone in the frame", fr: "Tout le monde dans le cadre" },
  headHint: { en: "Heads and shoulders in the light.", fr: "Têtes et épaules dans la lumière." },
  hold: { en: "Photo", fr: "Photo" },
  pose: { en: "Tap the shutter.", fr: "Touchez l’obturateur." },
  ready: { en: "Get ready", fr: "Préparez-vous" },
  holdStill: { en: "Hold still", fr: "Ne bougez plus" },
  cancelShot: { en: "Cancel", fr: "Annuler" },
  imReady: { en: "I’m ready", fr: "Je suis prêt" },
  flip: { en: "Flip", fr: "Inverser" },
  library: { en: "Upload", fr: "Importer" },
  upload: { en: "Upload a photo", fr: "Importer une photo" },
  fromComputer: { en: "From this computer", fr: "Depuis cet ordinateur" },
  pick: { en: "Choose a look", fr: "Choisissez un portrait" },
  surprise: { en: "Same face. New clothes or place.", fr: "Même visage. Nouveaux vêtements ou lieu." },
  lucky: { en: "Surprise", fr: "Surprise" },
  wallPlay: { en: "Play the wall", fr: "Lancer le mur" },
  wallStop: { en: "Leave the wall", fr: "Quitter le mur" },
  room: (n: number, max = 3) => ({
    en: n ? `${n} of ${max}` : `Up to ${max}`,
    fr: n ? `${n} sur ${max}` : `Jusqu’à ${max}`,
  }),
  again: { en: "Again", fr: "Encore" },
  make: (n: number) => ({
    en: n ? `Create ${n}` : "Choose a look",
    fr: n ? `Créer ${n}` : "Choisissez un portrait",
  }),
  filmOn: { en: "Film on", fr: "Avec film" },
  filmOff: { en: "Photo only", fr: "Photo seule" },
  formatAsk: { en: "Photo, film, or both?", fr: "Photo, film, ou les deux ?" },
  formatPhoto: { en: "Photo", fr: "Photo" },
  formatFilm: { en: "Film", fr: "Film" },
  formatBoth: { en: "Both", fr: "Les deux" },
  formatPhotoHint: { en: "Stills only.", fr: "Portraits seuls." },
  formatFilmHint: { en: "Stills plus a moving portrait.", fr: "Clichés, plus un film." },
  formatBothHint: { en: "Stills and film.", fr: "Portraits et film." },
  entering: { en: "Your portrait is on the way.", fr: "Votre portrait arrive." },
  next: { en: "Next guest", fr: "Invité suivant" },
  keep: { en: "Save to phone", fr: "Enregistrer sur le téléphone" },
  atelier: { en: "Studio", fr: "Atelier" },
  scanKeep: { en: "Scan this QR to save the portrait on your phone.", fr: "Scannez ce QR pour enregistrer le portrait sur votre téléphone." },
  holdSave: { en: "Hold the image to save.", fr: "Maintenez l’image pour l’enregistrer." },
  openImage: { en: "Open the image", fr: "Ouvrir l’image" },
  shareFile: { en: "Share this print", fr: "Partager ce cliché" },
  keepPhone: { en: "Save to Photos", fr: "Enregistrer dans Photos" },
  keepHint: { en: "Choose Save Image, or hold the portrait.", fr: "Choisissez Enregistrer l’image, ou maintenez le portrait." },
  mail: { en: "Email this photo", fr: "Recevoir par email" },
  mailOk: { en: "The framed photo is on its way to that inbox.", fr: "Le cliché encadré part vers cette boîte mail." },
  mailOpen: { en: "Open Mail to send the framed photo.", fr: "Ouvrez Mail pour envoyer le cliché encadré." },
  share: { en: "Share", fr: "Partager" },
  copied: { en: "Copied", fr: "Copié" },
  print: { en: "Print", fr: "Imprimer" },
  lensTap: { en: "Become the camera", fr: "Devenir l’appareil" },
  lensHold: { en: "You are the camera. Leave this page open.", fr: "Vous êtes l’appareil. Laissez cette page ouverte." },
  lensLive: { en: "Phone", fr: "Téléphone" },
  lensLocal: { en: "This screen", fr: "Cet écran" },
  lensHint: { en: "Scan with the phone. Guests tap the laptop.", fr: "Scannez avec le téléphone. Les invités tapent l’ordinateur." },
  noLooks: { en: "No portraits left.", fr: "Plus de portraits." },
  live: { en: "Live", fr: "En direct" },
  holding: { en: "Holding", fr: "En attente" },
  linking: { en: "Linking…", fr: "Connexion…" },
  tap: { en: "Tap the screen.", fr: "Touchez l’écran." },
  opening: { en: "Opening…", fr: "Ouverture…" },
  queued: { en: "Saved on this device.", fr: "Enregistré sur cet appareil." },
  queuedHint: { en: "It sends when the signal returns.", fr: "Envoi dès le retour du réseau." },
  you: { en: "You", fr: "Vous" },
  look: { en: "Look", fr: "Portrait" },
  filmSoon: { en: "Film is still coming.", fr: "Le film arrive." },
  thisPhoto: { en: "This photo?", fr: "Cette photo ?" },
  useThis: { en: "Use this", fr: "Utiliser" },
  thisIsIt: { en: "This is the one", fr: "C’est celle-ci" },
  stepPhoto: { en: "Photo", fr: "Photo" },
  stepPlace: { en: "Place", fr: "Lieu" },
  stepPrint: { en: "Print", fr: "Cliché" },
  pathLine: { en: "Photo · Place · Print", fr: "Photo · Lieu · Cliché" },
  camWait: { en: "Opening the lens…", fr: "L’objectif s’ouvre…" },
  camNeed: { en: "Allow the camera, or import a portrait.", fr: "Autorisez la caméra, ou importez un portrait." },
  retryCam: { en: "Open the camera", fr: "Ouvrir la caméra" },
  snapFail: { en: "The shutter missed. Try again, or import.", fr: "L’obturateur a manqué. Réessayez, ou importez." },
  cameraHint: { en: "Heads and shoulders in the light.", fr: "Têtes et épaules dans la lumière." },
  doors: { en: "How guests move", fr: "Le passage des invités" },
  pathPhoto: { en: "They take a photo, or import one from this laptop.", fr: "Ils prennent une photo, ou l’importent depuis cet ordinateur." },
  pathPlaceGuest: { en: "They choose a place — up to three.", fr: "Ils choisissent un lieu — jusqu’à trois." },
  pathPlaceAuto: { en: "You choose the place. They only take the photo.", fr: "Vous choisissez le lieu. Ils ne font que la photo." },
  pathPrint: { en: "They keep the print on a QR, then the next guest steps in.", fr: "Ils gardent le cliché sur un QR, puis l’invité suivant." },
  later: { en: "Scan later", fr: "Scanner plus tard" },
  send: { en: "Send", fr: "Envoyer" },
  wall: { en: "The wall", fr: "Le mur" },
  waiting: { en: "Waiting for the first guest.", fr: "En attente du premier invité." },
  keepShort: { en: "Keep", fr: "Garder" },
  email: { en: "Email", fr: "Votre email" },
  prev: { en: "Previous", fr: "Précédent" },
  nextShot: { en: "Next", fr: "Suivant" },
  youAlt: { en: "You", fr: "Vous" },
  sourceAlt: { en: "The photo you gave", fr: "La photo donnée" },
  souvenirQr: { en: "Souvenir QR", fr: "QR du souvenir" },
  boothDown: { en: "Booth unavailable", fr: "Booth indisponible" },
  flipFail: { en: "Could not flip the camera.", fr: "Impossible d’inverser." },
  camAllow: {
    en: "Allow the camera. Use https or the same Wi‑Fi page.",
    fr: "Autorisez la caméra.",
  },
  offline: { en: "Offline", fr: "Hors ligne" },
  expired: { en: "This souvenir has expired.", fr: "Ce souvenir a expiré." },
  mailFail: { en: "Could not save email", fr: "Impossible d’enregistrer l’email" },
  filmMiss: { en: "The film did not arrive.", fr: "Le film n’est pas arrivé." },
  keepFilm: { en: "Keep the film", fr: "Garder le film" },
  noPlaceOpen: { en: "No look is open.", fr: "Aucun portrait n’est ouvert." },
  tapPlace: { en: "Tap at least one look.", fr: "Touchez au moins un portrait." },
  needEmail: { en: "An email is asked.", fr: "Un email est demandé." },
  badImage: { en: "Could not read this image. Use JPG or PNG.", fr: "Impossible de lire cette image. Utilisez JPG ou PNG." },
  boothStartFail: { en: "The booth could not start.", fr: "Le booth n’a pas pu démarrer." },
  defaultSubtitle: { en: "Your face. Another world.", fr: "Votre visage. Un autre lieu." },
  attractHint: { en: "Internet Governance Forum · N’Djamena", fr: "Forum sur la gouvernance de l’Internet · N’Djamena" },
};

export function catFr(name: string) {
  return CAT_FR[name] || name;
}

export const CAT_FR: Record<string, string> = {
  All: "Tous",
  Atelier: "Atelier",
  XR: "XR",
  Spatial: "XR",
  Birthday: "Anniv.",
  Wedding: "Mariage",
  Party: "Fête",
  Baby: "Bébé",
  Grad: "Diplôme",
  Chad: "Tchad",
  Tchad: "Tchad",
  Horizon: "Tchad",
  Worlds: "Mondes",
  Night: "Nuit",
  Identity: "Nuit",
  Art: "Art",
  Custom: "Sur mesure",
  Gouvernance: "Gouvernance",
  Jeunesse: "Jeunesse",
  IA: "IA",
  Nation: "Nation",
  Sahel: "Sahel",
  "N’Djamena": "N’Djamena",
  "N'Djamena": "N’Djamena",
  Forum: "Forum",
  FGI: "FGI",
  Cybersécurité: "Cybersécurité",
  Éducation: "Éducation",
  Cyber: "Cybersécurité",
  École: "Éducation",
  Réseau: "Réseau",
};

/** French is the guest language. English sits underneath. */
export function Pair({ en, fr, className = "" }: { en: string; fr: string; className?: string }) {
  return (
    <span className={className}>
      <span className="block">{fr}</span>
      <span className="pair-fr">{en}</span>
    </span>
  );
}

export function KioskSteps({ at, done }: { at: 1 | 2 | 3; done?: boolean }) {
  const items = [
    { n: 1 as const, ...copy.stepPhoto },
    { n: 2 as const, ...copy.stepPlace },
    { n: 3 as const, ...copy.stepPrint },
  ];
  return (
    <ol className="kiosk-steps" aria-label="Étapes">
      {items.map((item) => (
        <li key={item.n} data-on={!done && at === item.n ? "true" : undefined} data-done={done || at > item.n ? "true" : undefined}>
          <b>{item.n}</b>
          <span>{item.fr}</span>
        </li>
      ))}
    </ol>
  );
}

export function PathWhisper({ className = "" }: { className?: string } = {}) {
  return (
    <p className={`path-whisper ${className}`.trim()} aria-hidden>
      <span>{copy.stepPhoto.fr}</span>
      <i />
      <span>{copy.stepPlace.fr}</span>
      <i />
      <span>{copy.stepPrint.fr}</span>
    </p>
  );
}

const ENGLISH_SUBTITLE = /^your face\.\s*another (world|place)\.?$/i;

/** Guest screen: French first. Stored English lines fall back to the house sentence. */
export function guestSubtitle(stored?: string | null) {
  const value = (stored || "").trim();
  if (!value || ENGLISH_SUBTITLE.test(value)) return copy.defaultSubtitle.fr;
  return value;
}
