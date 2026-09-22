export async function readApiJson<T extends Record<string, unknown> = Record<string, unknown>>(
  response: Response,
): Promise<T> {
  const type = response.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    return (await response.json()) as T;
  }
  return {
    error: "Le serveur a renvoyé une page au lieu de JSON. Vérifiez les variables d’environnement sur Vercel.",
  } as unknown as T;
}
