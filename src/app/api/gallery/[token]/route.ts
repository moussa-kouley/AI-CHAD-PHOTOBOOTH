import { jsonError } from "@/lib/errors";
import { eventGuestBooth } from "@/lib/fgi-agenda";
import { listLocalGallery } from "@/lib/event-guest";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const booth = eventGuestBooth();
    const photos = await listLocalGallery(token);
    return Response.json({
      name: booth.name,
      photos: photos.map(({ id, image, title, sharePath }) => ({ id, image, title, sharePath })),
    });
  } catch (error) {
    return jsonError(error);
  }
}
