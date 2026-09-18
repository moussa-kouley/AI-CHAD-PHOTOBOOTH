export type LensRole = "kiosk" | "lens";

export type LensPacket = {
  type: "hello" | "offer" | "answer" | "ice" | "flip" | "shutter" | "bye" | "shot" | "facing";
  from: LensRole;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit | null;
  facing?: "user" | "environment";
};

type Listener = (packet: LensPacket) => void;

type Room = {
  listeners: Record<LensRole, Set<Listener>>;
  latest: Partial<Record<LensRole, LensPacket>>;
  offer?: LensPacket;
  answer?: LensPacket;
  shot?: { buf: Buffer; type: string; at: number };
};

const g = globalThis as unknown as { __lumenLens?: Map<string, Room> };
if (!g.__lumenLens) g.__lumenLens = new Map();
const rooms = g.__lumenLens;

function room(token: string) {
  let found = rooms.get(token);
  if (!found) {
    found = { listeners: { kiosk: new Set(), lens: new Set() }, latest: {} };
    rooms.set(token, found);
  }
  return found;
}

function other(role: LensRole): LensRole {
  return role === "kiosk" ? "lens" : "kiosk";
}

export function publish(token: string, packet: LensPacket) {
  const found = room(token);
  found.latest[packet.from] = packet;
  if (packet.type === "offer") found.offer = packet;
  if (packet.type === "answer") found.answer = packet;
  if (packet.type === "hello" && packet.from === "kiosk") {
    found.offer = undefined;
    found.answer = undefined;
  }
  for (const fn of found.listeners[other(packet.from)]) fn(packet);
}

export function subscribe(token: string, role: LensRole, fn: Listener) {
  const found = room(token);
  found.listeners[role].add(fn);
  const peer = found.latest[other(role)];
  if (peer?.type === "hello") queueMicrotask(() => fn(peer));
  if (role === "kiosk" && found.offer) queueMicrotask(() => fn(found.offer!));
  if (role === "lens" && found.answer) queueMicrotask(() => fn(found.answer!));
  return () => {
    found.listeners[role].delete(fn);
  };
}

export function putShot(token: string, buf: Buffer, type: string) {
  const found = room(token);
  found.shot = { buf, type, at: Date.now() };
}

export function takeShot(token: string) {
  const found = rooms.get(token);
  if (!found?.shot) return null;
  if (Date.now() - found.shot.at > 20_000) {
    found.shot = undefined;
    return null;
  }
  const shot = found.shot;
  found.shot = undefined;
  return shot;
}
