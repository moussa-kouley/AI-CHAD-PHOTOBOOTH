import { coverDraw } from "./fill-frame";

/** Letterbox a still into the target. Never crop the source. */
export function containCenter(
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number,
  focusY = 0.5,
) {
  const scale = Math.min(targetW / Math.max(1, sourceW), targetH / Math.max(1, sourceH));
  const dw = sourceW * scale;
  const dh = sourceH * scale;
  return {
    dx: (targetW - dw) / 2,
    dy: (targetH - dh) * focusY,
    dw,
    dh,
  };
}

export function drawContained(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number,
) {
  const { dx, dy, dw, dh } = containCenter(sourceW, sourceH, targetW, targetH);
  ctx.drawImage(source, 0, 0, sourceW, sourceH, dx, dy, dw, dh);
}

export function drawCovered(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number,
) {
  coverDraw(ctx, source, sourceW, sourceH, targetW, targetH);
}
