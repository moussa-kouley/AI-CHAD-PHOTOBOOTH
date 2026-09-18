const MAX_EDGE = 4096;
const JPEG_QUALITY = 0.93;

const DB = "lumen-booth";
const STORE = "uploads";

export type QueuedCapture = {
  id: string;
  boothToken: string;
  promptId: string;
  promptIds?: string[];
  wantVideo: boolean;
  consent: boolean;
  email?: string;
  blob: Blob;
  createdAt: number;
  attempts: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueCapture(item: QueuedCapture) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listQueue() {
  const db = await openDb();
  return new Promise<QueuedCapture[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result as QueuedCapture[]);
    request.onerror = () => reject(request.error);
  });
}

export async function removeQueued(id: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function flushQueue() {
  if (!navigator.onLine) return [];
  const items = await listQueue();
  const done: string[] = [];
  for (const item of items) {
    const form = new FormData();
    form.set("boothToken", item.boothToken);
    form.set("promptId", item.promptId);
    form.set("promptIds", JSON.stringify(item.promptIds?.length ? item.promptIds : [item.promptId]));
    form.set("wantVideo", String(item.wantVideo));
    form.set("consent", "true");
    form.set("offlineId", item.id);
    if (item.email) form.set("email", item.email);
    form.set("photo", item.blob, guestPhotoFilename(item.blob));
    try {
      const response = await fetch("/api/sessions", { method: "POST", body: form });
      if (response.ok) {
        await removeQueued(item.id);
        done.push(item.id);
      }
    } catch {
      // stay queued for the next online window
    }
  }
  return done;
}

export async function compressLogo(file: File, maxEdge = 2048) {
  const keepAlpha = file.type === "image/png" || file.type === "image/webp";
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(file);
    });
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  if (keepAlpha) return canvas.toDataURL("image/png");
  return canvas.toDataURL("image/jpeg", 0.95);
}

function isKeptRaster(type: string) {
  return type === "image/jpeg" || type === "image/jpg" || type === "image/png" || type === "image/webp";
}

export function guestPhotoFilename(blob: Blob) {
  if (blob.type === "image/png") return "capture.png";
  if (blob.type === "image/webp") return "capture.webp";
  return "capture.jpg";
}

async function bitmapFromBlob(blob: Blob) {
  try {
    return await createImageBitmap(blob, { imageOrientation: "from-image" });
  } catch {
    try {
      return await createImageBitmap(blob);
    } catch {
      const url = URL.createObjectURL(blob);
      try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error("unreadable"));
          el.src = url;
        });
        const scratch = document.createElement("canvas");
        scratch.width = image.naturalWidth || image.width;
        scratch.height = image.naturalHeight || image.height;
        const ctx = scratch.getContext("2d");
        if (!ctx) throw new Error("canvas");
        ctx.drawImage(image, 0, 0);
        return await createImageBitmap(scratch);
      } finally {
        URL.revokeObjectURL(url);
      }
    }
  }
}

function blobFromCanvas(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

function jpegExifOrientation(bytes: ArrayBuffer) {
  const view = new DataView(bytes);
  if (view.byteLength < 12 || view.getUint16(0) !== 0xffd8) return 1;
  let offset = 2;
  while (offset + 8 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    const size = view.getUint16(offset + 2);
    if (marker === 0xe1 && size >= 8) {
      const start = offset + 4;
      if (view.getUint32(start) === 0x45786966 && view.getUint16(start + 4) === 0) {
        const tiff = start + 6;
        const little = view.getUint16(tiff) === 0x4949;
        const u16 = (at: number) => view.getUint16(at, little);
        const u32 = (at: number) => view.getUint32(at, little);
        const ifd0 = tiff + u32(tiff + 4);
        if (ifd0 + 2 > view.byteLength) return 1;
        const entries = u16(ifd0);
        for (let i = 0; i < entries; i += 1) {
          const entry = ifd0 + 2 + i * 12;
          if (entry + 10 > view.byteLength) break;
          if (u16(entry) === 0x0112) return u16(entry + 8) || 1;
        }
      }
    }
    if (marker === 0xda) break;
    offset += 2 + size;
  }
  return 1;
}

async function needsExifRotate(blob: Blob) {
  if (blob.type && blob.type !== "image/jpeg" && blob.type !== "image/jpg") return false;
  try {
    return jpegExifOrientation(await blob.arrayBuffer()) > 1;
  } catch {
    return false;
  }
}

/** Keep the guest still. No letterbox, crop, grade, or restyle. Rotate EXIF; downscale only if huge. */
export async function compressPortrait(blob: Blob, maxEdge = MAX_EDGE) {
  const type = blob.type || "";
  const bitmap = await bitmapFromBlob(blob);
  try {
    const maxDim = Math.max(bitmap.width, bitmap.height);
    const keepRaster = isKeptRaster(type);
    const rotate = await needsExifRotate(blob);
    const scale = Math.min(1, maxEdge / Math.max(1, maxDim));
    if (keepRaster && !rotate && scale >= 1) return blob;

    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return blob;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);

    const preferPng = type === "image/png";
    const encoded = await blobFromCanvas(canvas, preferPng ? "image/png" : "image/jpeg", preferPng ? undefined : JPEG_QUALITY);
    return encoded || blob;
  } finally {
    bitmap.close();
  }
}

export async function compressImage(blob: Blob, maxEdge = 1280, quality = 0.72) {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return blob;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const compressed = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  return compressed || blob;
}
