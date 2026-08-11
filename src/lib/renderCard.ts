import { drawImageCover } from './image';

const CARD_W = 1600;
const CARD_H = 900;
const SVG_W = 1260;
const SVG_H = 708;
const TEMPLATE_URL = `${import.meta.env.BASE_URL}id-card-template.svg`;

let templatePromise: Promise<HTMLImageElement> | null = null;

function loadTemplate(): Promise<HTMLImageElement> {
  if (templatePromise) return templatePromise;

  templatePromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new Error(
          'Could not load the new ID card template. Make sure public/id-card-template.svg exists.',
        ),
      );
    image.src = TEMPLATE_URL;
  });

  return templatePromise;
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string,
): string {
  ctx.font = font;

  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }

  let value = text;
  while (value.length > 1 && ctx.measureText(`${value}…`).width > maxWidth) {
    value = value.slice(0, -1);
  }

  return `${value}…`;
}

function makeTeamId(name: string, stack: string): string {
  const source = `${name}|${stack}`.trim() || 'BUILDER';

  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
  }

  return `HH_${String(hash % 10000).padStart(4, '0')}`;
}

function drawPhotoCircle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  sx: number,
  sy: number,
): void {
  const scale = Math.min(sx, sy);

  // Exact center of the circular photo window in the SVG.
  const cx = 216 * sx;
  const cy = 251 * sy;
  const r = 101 * scale;

  ctx.save();

  // Keep the uploaded image completely inside the circular frame.
  // A slightly lower zoom than before prevents unnecessary cropping.
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  drawImageCover(
    ctx,
    img,
    cx - r,
    cy - r,
    r * 2,
    r * 2,
    0.92,
  );

  // Subtle printed-paper grade.
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = 'rgba(255, 205, 125, 0.12)';
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  ctx.restore();

  // Clean inner outline.
  ctx.strokeStyle = '#274b24';
  ctx.lineWidth = 2.2 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

function coverNameAndSpec(
  ctx: CanvasRenderingContext2D,
  name: string,
  stack: string,
  sx: number,
  sy: number,
): void {
  const scale = Math.min(sx, sy);
  const paper = '#fff2d3';

  // Cover the baked SVG text while preserving the original boxes.
  const boxes = [
    { x: 95, y: 401, w: 250, h: 53 },
    { x: 95, y: 473, w: 250, h: 53 },
  ];

  boxes.forEach(({ x, y, w, h }) => {
    const px = x * sx;
    const py = y * sy;
    const pw = w * sx;
    const ph = h * sy;
    const radius = 18 * scale;

    ctx.fillStyle = paper;
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2.6 * scale;

    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, radius);
    ctx.fill();
    ctx.stroke();
  });

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#274b24';

  // Smaller name font so long names stay comfortably inside the box.
  const nameFont = `800 ${24 * scale}px Arial, sans-serif`;
  ctx.font = nameFont;
  ctx.fillText(
    fitText(
      ctx,
      (name || 'YOUR NAME').toUpperCase(),
      205 * sx,
      nameFont,
    ),
    220 * sx,
    428 * sy,
  );

  // Smaller role/stack font.
  const stackFont = `800 ${21 * scale}px Arial, sans-serif`;
  ctx.font = stackFont;
  ctx.fillText(
    fitText(
      ctx,
      (stack || 'BUILDER').toUpperCase(),
      205 * sx,
      stackFont,
    ),
    220 * sx,
    500 * sy,
  );

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
}

function coverTeamId(
  ctx: CanvasRenderingContext2D,
  name: string,
  stack: string,
  sx: number,
  sy: number,
): void {
  const scale = Math.min(sx, sy);
  const paper = '#fff2d3';
  const teamId = makeTeamId(name, stack);

  /*
   * The original sample ID is inside the upper-right team-id panel.
   * Keep the panel border intact and only cover the interior text area.
   */
  const x = 808;
  const y = 143;
  const w = 255;
  const h = 75;

  ctx.fillStyle = paper;
  ctx.fillRect(
    x * sx,
    y * sy,
    w * sx,
    h * sy,
  );

  // Smaller + width-constrained ID so it can NEVER escape the panel.
  const font = `800 ${32 * scale}px Arial, sans-serif`;

  ctx.fillStyle = '#274b24';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = font;

  ctx.fillText(
    fitText(ctx, teamId, 220 * sx, font),
    828 * sx,
    184 * sy,
  );

  ctx.textBaseline = 'alphabetic';
}

function redrawDecorativeDynamicDetails(
  ctx: CanvasRenderingContext2D,
  name: string,
  stack: string,
  sx: number,
  sy: number,
): void {
  const id = makeTeamId(name, stack);

  ctx.fillStyle = '#274b24';
  ctx.textAlign = 'center';
  ctx.font = `700 ${8 * Math.min(sx, sy)}px Arial, sans-serif`;

  ctx.fillText(
    `ID • ${id}`,
    1040 * sx,
    535 * sy,
  );

  ctx.textAlign = 'left';
}

/**
 * Renders the supplied SVG artwork as the ID-card template and overlays
 * the app's dynamic data: photo, name, stack/role and generated team ID.
 */
export async function renderCard(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  name: string,
  stack: string,
  _title: string,
): Promise<void> {
  const template = await loadTemplate();

  ctx.clearRect(0, 0, CARD_W, CARD_H);

  // Render the complete SVG template without cropping.
  // SVG and canvas have virtually the same aspect ratio, so the artwork
  // remains fully visible edge-to-edge.
  ctx.drawImage(
    template,
    0,
    0,
    CARD_W,
    CARD_H,
  );

  const sx = CARD_W / SVG_W;
  const sy = CARD_H / SVG_H;

  drawPhotoCircle(ctx, img, sx, sy);
  coverNameAndSpec(ctx, name, stack, sx, sy);
  coverTeamId(ctx, name, stack, sx, sy);
  redrawDecorativeDynamicDetails(ctx, name, stack, sx, sy);
}