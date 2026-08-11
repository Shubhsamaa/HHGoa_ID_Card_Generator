import { BRAND, EVENT } from './constants';
import { roundRect } from './image';
import { aestheticPhoto, drawBeveledBorder, drawCastShadow } from './photoFX';

export function renderPfp(ctx: CanvasRenderingContext2D, img: HTMLImageElement): void {
  const W = 1024;
  const H = 1024;
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = BRAND.green;
  ctx.fillRect(0, 0, W, H);

  // Subtle texture dots
  ctx.fillStyle = 'rgba(255, 237, 0, 0.04)';
  for (let i = 0; i < 400; i++) {
    const px = (i * 37) % W;
    const py = (i * 53) % H;
    ctx.fillRect(px, py, 2, 2);
  }

  // Header
  ctx.fillStyle = BRAND.yellow;
  ctx.font = '700 28px "DM Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('HH GOA 2026', 56, 48);
  ctx.font = '500 18px "DM Mono", monospace';
  ctx.fillText('FRAME IN GOA / 01', 56, 86);

  // Hashtag pill
  ctx.fillStyle = BRAND.pink;
  roundRect(ctx, 867, 51, 92, 26, 4);
  ctx.fill();
  ctx.fillStyle = BRAND.green;
  ctx.font = '700 15px "DM Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(EVENT.hashtag, 913, 64);

  // Photo with aesthetic processing + 3D beveled frame
  const photoX = 94;
  const photoY = 172;
  const photoSize = 836;

  // Cast shadow beneath
  drawCastShadow(ctx, photoX, photoY, photoSize, photoSize, 18, 28, 14);

  // Aesthetic photo (color grade + vignette + grain)
  aestheticPhoto(ctx, img, photoX, photoY, photoSize, photoSize, 18, 1.04);

  // 3D beveled border
  drawBeveledBorder(ctx, photoX, photoY, photoSize, photoSize, 18, BRAND.yellow);

  // Corner accent marks (3D depth cues)
  drawCornerAccent(ctx, photoX - 6, photoY - 6, 40, BRAND.pink);

  // Bottom display type
  ctx.fillStyle = BRAND.yellow;
  ctx.font = '500 76px "Oswald", Impact, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('SHOW UP.', 58, 980);

  // Subtle bottom shadow under text for depth
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillText('SHOW UP.', 60, 982);
  ctx.fillStyle = BRAND.yellow;
  ctx.fillText('SHOW UP.', 58, 980);
}

function drawCornerAccent(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  // Small triangular notch at top-left for a "tab" feel
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
