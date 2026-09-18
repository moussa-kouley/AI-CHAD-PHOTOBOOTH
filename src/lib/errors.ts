import { logger } from "./logger";
import { apiCopy } from "./studio-copy";

export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "APP_ERROR",
  ) {
    super(message);
  }
}

export function jsonError(error: unknown) {
  if (error instanceof AppError) {
    return Response.json({ error: error.message, code: error.code }, { status: error.status });
  }
  if (error && typeof error === "object" && "issues" in error) {
    const issues = (error as { issues: Array<{ message?: string; path?: PropertyKey[] }> }).issues || [];
    const first = issues[0];
    const where = first?.path?.filter(Boolean).join(".") || "formulaire";
    return Response.json({
      error: first?.message ? `${where}: ${first.message}` : apiCopy.invalidRequest,
      code: "VALIDATION",
    }, { status: 400 });
  }
  logger.error({ error }, "Unhandled API error");
  return Response.json({ error: apiCopy.unexpected, code: "INTERNAL" }, { status: 500 });
}
