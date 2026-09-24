import { AppError, jsonError } from "@/lib/errors";
import { publish, subscribe, type LensPacket, type LensRole } from "@/lib/lens-hub";
import { apiCopy } from "@/lib/studio-copy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const role = new URL(request.url).searchParams.get("role") as LensRole | null;
    if (role !== "kiosk" && role !== "lens") throw new AppError(400, apiCopy.missingRole, "ROLE");

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const send = (packet: LensPacket) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(packet)}\n\n`));
          } catch {
            // closed
          }
        };
        try {
          controller.enqueue(encoder.encode(":ok\n\n"));
        } catch {
          // closed immediately
        }
        const stop = subscribe(token, role, send);
        const ping = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(":ping\n\n"));
          } catch {
            clearInterval(ping);
          }
        }, 15000);
        const close = () => {
          clearInterval(ping);
          stop();
          try {
            controller.close();
          } catch {
            // already closed
          }
        };
        request.signal.addEventListener("abort", close);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const packet = (await request.json()) as LensPacket;
    if (!packet?.type || (packet.from !== "kiosk" && packet.from !== "lens")) {
      throw new AppError(400, apiCopy.invalidPacket, "PACKET");
    }
    publish(token, packet);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
