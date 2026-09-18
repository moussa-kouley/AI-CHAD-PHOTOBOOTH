import type { LensPacket, LensRole } from "./lens-hub";
import { apiCopy } from "./studio-copy";

export type { LensPacket, LensRole };

export function iceConfig(): RTCConfiguration {
  return { iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] };
}

export async function postLens(token: string, packet: LensPacket) {
  await fetch(`/api/kiosk/${token}/lens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(packet),
  });
}

export function openLensEvents(token: string, role: LensRole, onPacket: (packet: LensPacket) => void) {
  const source = new EventSource(`/api/kiosk/${token}/lens?role=${role}`);
  source.onmessage = (event) => {
    try {
      onPacket(JSON.parse(event.data) as LensPacket);
    } catch {
      // ignore keepalives
    }
  };
  return () => source.close();
}

export async function postLensShot(token: string, blob: Blob) {
  const form = new FormData();
  form.set("photo", blob, "capture.jpg");
  const response = await fetch(`/api/kiosk/${token}/lens/shot`, { method: "POST", body: form });
  if (!response.ok) throw new Error(apiCopy.sendStillFail);
}

export async function takeLensShot(token: string) {
  const response = await fetch(`/api/kiosk/${token}/lens/shot`);
  if (!response.ok) return null;
  return response.blob();
}

export async function waitForLensShot(token: string, ms = 8000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const blob = await takeLensShot(token);
    if (blob && blob.size > 800) return blob;
    await new Promise((resolve) => window.setTimeout(resolve, 160));
  }
  return null;
}
