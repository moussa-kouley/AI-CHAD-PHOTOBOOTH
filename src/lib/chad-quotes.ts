export const WAIT_QUOTES = [
  { fr: "Encore un instant.", en: "Just a moment." },
  { fr: "N’Djamena prépare le cliché.", en: "N’Djamena is preparing the print." },
  { fr: "L’IA au service du visage.", en: "AI in service of the face." },
  { fr: "Votre photo arrive.", en: "Your photo is coming." },
] as const;

export function estimateWaitSeconds(remainingLooks: number) {
  const looks = Math.max(1, remainingLooks);
  // Looks run in parallel on wan2.7-image at 720×1280. Guest wait is first-photo time.
  return Math.min(18, 12 + (looks - 1) * 2);
}

export function formatWait(seconds: number) {
  if (seconds <= 4) return "Encore quelques secondes";
  if (seconds < 60) return `Environ ${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (!rest) return `Environ ${minutes} min`;
  return `Environ ${minutes} min ${rest} s`;
}
