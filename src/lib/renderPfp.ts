import { drawImageCover } from './image';

const W = 1024;
const H = 1024;

let framePromise: Promise<HTMLImageElement> | null = null;

function loadPfpFrame(): Promise<HTMLImageElement> {
  if (framePromise) return framePromise;

  framePromise = new Promise((resolve, reject) => {
    const frame = new Image();

    frame.onload = () => resolve(frame);
    frame.onerror = () =>
      reject(
        new Error(
          'Could not load PFP frame. Make sure public/pfp-frame.png exists.',
        ),
      );

    frame.src = `${import.meta.env.BASE_URL}pfp-frame.png`;
  });

  return framePromise;
}

export async function renderPfp(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
): Promise<void> {
  ctx.clearRect(0, 0, W, H);

  /*
   * The supplied frame was cropped to its actual artwork bounds:
   * 636 × 576.
   *
   * When scaled to 1024px wide:
   * frame height ≈ 927px
   *
   * This keeps the original frame proportions.
   */
  const frameW = 1024;
  const frameH = (576 / 636) * frameW;
  const frameX = 0;
  const frameY = (H - frameH) / 2;

  /*
   * Exact opening in the supplied frame.
   *
   * Center:
   * X = 512
   * Y = 512
   *
   * Radius ≈ 362px after scaling.
   */
  const photoCX = 512;
  const photoCY = 512;
  const photoR = 362;

  // --------------------------------------------------
  // 1. Draw uploaded photo FIRST
  // --------------------------------------------------

  ctx.save();

  // Circular photo mask
  ctx.beginPath();
  ctx.arc(photoCX, photoCY, photoR, 0, Math.PI * 2);
  ctx.clip();

  // Fill the complete circular opening.
  // Increase this value if you want the face closer.
  drawImageCover(
    ctx,
    img,
    photoCX - photoR,
    photoCY - photoR,
    photoR * 2,
    photoR * 2,
    1.08,
  );

  // Slight color treatment
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = 'rgba(255, 210, 150, 0.10)';
  ctx.fillRect(
    photoCX - photoR,
    photoCY - photoR,
    photoR * 2,
    photoR * 2,
  );

  ctx.restore();

  // --------------------------------------------------
  // 2. Draw the supplied HH Goa frame ON TOP
  // --------------------------------------------------

  const frame = await loadPfpFrame();

  ctx.drawImage(
    frame,
    frameX,
    frameY,
    frameW,
    frameH,
  );
}