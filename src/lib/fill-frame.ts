/** Cover-draw into a target. Slight downward bias keeps standing groups’ heads. */
export function coverDraw(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number,
  focusY = 0.42,
) {
  const scale = Math.max(targetW / Math.max(1, sourceW), targetH / Math.max(1, sourceH));
  const dw = sourceW * scale;
  const dh = sourceH * scale;
  const dx = (targetW - dw) / 2;
  const dy = (targetH - dh) * focusY;
  ctx.drawImage(source, 0, 0, sourceW, sourceH, dx, dy, dw, dh);
}
