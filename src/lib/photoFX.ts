import { drawImageCover, roundRect } from './image';

// Applies an aesthetic color grade to the photo region: warm highlights,
// teal shadows (complementary split-tone), boosted contrast + saturation,
// a soft vignette, and subtle film grain. Everything is composited inside
// a clipped path so it only affects the photo, never the frame chrome.

export function aestheticPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  zoom = 1.04,
): void {
  ctx.save();
  roundRect(ctx, x, y, w, h, radius);
  ctx.clip();

  // 1. Draw the photo
  drawImageCover(ctx, img, x, y, w, h, zoom);

  // 2. Warm orange wash in highlights (screen blend)
  ctx.globalCompositeOperation = 'overlay';
  const warmGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  warmGrad.addColorStop(0, 'rgba(255, 180, 60, 0.18)');
  warmGrad.addColorStop(0.5, 'rgba(255, 140, 40, 0.08)');
  warmGrad.addColorStop(1, 'rgba(255, 100, 20, 0.14)');
  ctx.fillStyle = warmGrad;
  ctx.fillRect(x, y, w, h);

  // 3. Cool teal in shadows (multiply blend)
  ctx.globalCompositeOperation = 'multiply';
  const coolGrad = ctx.createRadialGradient(
    x + w * 0.3, y + h * 0.7, 0,
    x + w * 0.5, y + h * 0.5, Math.max(w, h),
  );
  coolGrad.addColorStop(0, 'rgba(20, 60, 80, 0.12)');
  coolGrad.addColorStop(0.6, 'rgba(10, 30, 50, 0.05)');
  coolGrad.addColorStop(1, 'rgba(0, 15, 30, 0.0)');
  ctx.fillStyle = coolGrad;
  ctx.fillRect(x, y, w, h);

  // 4. Contrast boost via soft-light overlay
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fillRect(x, y, w, h);

  // 5. Saturation pop — use a semi-transparent saturated copy
  ctx.globalCompositeOperation = 'saturation';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(x, y, w, h);

  // Reset blend for vignette + grain
  ctx.globalCompositeOperation = 'source-over';

  // 6. Vignette — darken edges
  const vignette = ctx.createRadialGradient(
    x + w / 2, y + h / 2, Math.min(w, h) * 0.3,
    x + w / 2, y + h / 2, Math.max(w, h) * 0.72,
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
  vignette.addColorStop(1, 'rgba(0, 20, 10, 0.45)');
  ctx.fillStyle = vignette;
  ctx.fillRect(x, y, w, h);

  // 7. Subtle warm glow from top-left (key light feel)
  const keyLight = ctx.createRadialGradient(
    x + w * 0.25, y + h * 0.15, 0,
    x + w * 0.25, y + h * 0.15, Math.max(w, h) * 0.6,
  );
  keyLight.addColorStop(0, 'rgba(255, 230, 180, 0.1)');
  keyLight.addColorStop(1, 'rgba(255, 230, 180, 0)');
  ctx.fillStyle = keyLight;
  ctx.fillRect(x, y, w, h);

  // 8. Film grain — deterministic noise overlay
  drawGrain(ctx, x, y, w, h, 0.05);

  ctx.restore();
}

// Draws a deterministic film-grain pattern over a region.
// Uses a seeded PRNG so the grain is stable per-render (no flicker).
function drawGrain(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  intensity: number,
): void {
  const cellSize = 3;
  const cols = Math.ceil(w / cellSize);
  const rows = Math.ceil(h / cellSize);
  let seed = 1234567;

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const v = (seed >> 16) & 0xff;
      const alpha = ((v / 255) - 0.5) * intensity * 2;
      if (alpha > 0) {
        ctx.fillStyle = `rgba(255, 240, 200, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(0, 10, 5, ${-alpha})`;
      }
      ctx.fillRect(x + col * cellSize, y + row * cellSize, cellSize, cellSize);
    }
  }
  ctx.restore();
}

// Draws a 3D beveled border: outer highlight, inner shadow, and a corner
// sheen to give the frame physical depth.
export function drawBeveledBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  baseColor: string,
): void {
  ctx.save();

  // Drop shadow (depth below the card)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 12;
  roundRect(ctx, x, y, w, h, radius);
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Outer border (the main yellow frame)
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = 12;
  roundRect(ctx, x, y, w, h, radius);
  ctx.stroke();

  // Inner highlight (top-left light edge)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2;
  roundRect(ctx, x + 7, y + 7, w - 14, h - 14, radius - 4);
  ctx.stroke();

  // Inner shadow (bottom-right dark edge)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 2;
  roundRect(ctx, x + 5, y + 5, w - 10, h - 10, radius - 2);
  ctx.stroke();

  // Top-edge sheen gradient
  const sheen = ctx.createLinearGradient(x, y, x, y + 30);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.strokeStyle = sheen;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x + radius + 4, y + 4);
  ctx.lineTo(x + w - radius - 4, y + 4);
  ctx.stroke();

  ctx.restore();
}

// Draws a soft cast shadow beneath a rounded rect to simulate 3D lift.
export function drawCastShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  blur = 30,
  offsetY = 16,
): void {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = offsetY;
  roundRect(ctx, x, y, w, h, radius);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
  ctx.fill();
  ctx.restore();
}
