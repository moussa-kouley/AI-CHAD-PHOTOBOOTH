import { AppError, jsonError } from "@/lib/errors";
import { serializeSession } from "@/lib/session-dto";
import { apiCopy } from "@/lib/studio-copy";
import { readEventSession } from "@/lib/event-guest";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const local = await readEventSession(token);
    if (!local) throw new AppError(404, apiCopy.sessionExpired, "NOT_FOUND");
    return Response.json({ session: serializeSession(local) });
  } catch (error) {
    return jsonError(error);
  }
}
