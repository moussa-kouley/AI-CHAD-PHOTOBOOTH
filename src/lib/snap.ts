/** Capture the full video frame. Live view may contain; the file is never letterboxed. */
export async function snapPortrait(video: HTMLVideoElement, mirror: boolean) {
  const sourceW = video.videoWidth;
  const sourceH = video.videoHeight;
  if (!sourceW || !sourceH) return null;
  const canvas = document.createElement("canvas");
  canvas.width = sourceW;
  canvas.height = sourceH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  if (mirror) {
    ctx.translate(sourceW, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, sourceW, sourceH);
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.95));
}
