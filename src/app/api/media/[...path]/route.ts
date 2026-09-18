import path from "path";
import { readStored } from "@/lib/storage";
import { souvenirFilename } from "@/lib/social";

const types: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
};

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: parts } = await params;
    const relative = parts.join("/");
    const file = await readStored(relative);
    const ext = path.extname(relative).toLowerCase();
    const query = new URL(request.url).searchParams;
    const download = Boolean(query.get("download"));
    const mime = types[ext] || (ext === ".mp4" ? "video/mp4" : "image/jpeg");
    const filename = souvenirFilename(ext, query.get("name"));
    const disposition = `${download ? "attachment" : "inline"}; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(file.byteLength),
        "Cache-Control": "public, max-age=86400, immutable",
        "X-Content-Type-Options": "nosniff",
        "Accept-Ranges": "bytes",
        "Content-Disposition": disposition,
      },
    });
  } catch {
    return new Response("Introuvable", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
    });
  }
}
