import { jsonError } from "@/lib/errors";
import { eventGuestBooth, eventGuestPrompts } from "@/lib/fgi-agenda";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    await params;
    return Response.json(
      { booth: eventGuestBooth(), prompts: eventGuestPrompts() },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
