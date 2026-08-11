// Loads an image from a File (supports JPG, PNG, and HEIC via heic2any).
// Returns an HTMLImageElement ready to draw onto a canvas.
export async function fileToImage(file: File): Promise<HTMLImageElement> {
  let blob: Blob = file;

  // HEIC / HEIF from iPhone — convert to JPEG so canvas can read it.
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.heic$|\.heif$/i.test(file.name);

  if (isHeic) {
    const heic2any = (await import('heic2any')).default;
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    blob = Array.isArray(converted) ? converted[0] : converted;
  }

  const url = URL.createObjectURL(blob);
  try {
    return await loadImageFromUrl(url);
  } finally {
    // Revoke after the image is decoded so we don't leak object URLs.
    URL.revokeObjectURL(url);
  }
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

// Draws an image into a target box using "cover" sizing (fills the box,
// cropping overflow) with optional offset to keep off-center faces in view.
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  zoom = 1,
) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let drawW: number;
  let drawH: number;
  if (imgRatio > boxRatio) {
    drawH = h * zoom;
    drawW = drawH * imgRatio;
  } else {
    drawW = w * zoom;
    drawH = drawW / imgRatio;
  }
  const dx = x + (w - drawW) / 2;
  const dy = y + (h - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);
}

// Crops a photo with zoom and offset, returning a new File.
// Used by the crop step so users can position their face before rendering.
export async function cropPhoto(
  file: File,
  zoom: number,
  offset: { x: number; y: number },
): Promise<File> {
  const img = await fileToImage(file);
  const aspectRatio = 290 / 360; // polaroid photo area in the card
  const sourceSize = Math.min(img.width, img.height) / zoom;
  const sourceW = sourceSize;
  const sourceH = sourceSize / aspectRatio;
  const maxOffsetX = (img.width - sourceW) / 2;
  const maxOffsetY = (img.height - sourceH) / 2;
  const sx = img.width / 2 - sourceW / 2 + offset.x * maxOffsetX;
  const sy = img.height / 2 - sourceH / 2 + offset.y * maxOffsetY;
  const canvas = document.createElement('canvas');
  canvas.width = 580;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, sx, sy, sourceW, sourceH, 0, 0, 580, 720);
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Crop failed'))), 'image/png', 0.95),
  );
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '-cropped.png', { type: 'image/png' });
}

// Rounds a path rectangle — helper for modern card corners.
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
