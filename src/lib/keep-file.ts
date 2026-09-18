import { SOCIAL_FILENAME } from "./social";

function asFile(blob: Blob, filename: string, fallbackType: string) {
  const type = blob.type && blob.type !== "application/octet-stream" && !blob.type.includes("text/html")
    ? blob.type
    : fallbackType;
  return new File([blob], filename, { type });
}

async function framedBlob(url: string) {
  const response = await fetch(url, { credentials: "same-origin" });
  if (!response.ok) throw new Error("download");
  const header = (response.headers.get("content-type") || "").toLowerCase();
  if (header.includes("text/html")) throw new Error("html");
  const blob = await response.blob();
  if ((blob.type || "").includes("html")) throw new Error("html");
  return blob;
}

export async function saveFramedImage(url: string, filename = SOCIAL_FILENAME) {
  const blob = await framedBlob(url);
  const type = filename.endsWith(".mp4") ? "video/mp4" : "image/jpeg";
  const file = asFile(blob, filename, type);
  const href = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 2500);
  return "downloaded" as const;
}

export async function shareFramedImage(url: string, filename = SOCIAL_FILENAME) {
  const blob = await framedBlob(url);
  const type = filename.endsWith(".mp4") ? "video/mp4" : "image/jpeg";
  const file = asFile(blob, filename, type);
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: filename });
    return true;
  }
  if (navigator.share) {
    await navigator.share({ title: filename, url: window.location.href });
    return true;
  }
  return false;
}

export function openFramedImage(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
