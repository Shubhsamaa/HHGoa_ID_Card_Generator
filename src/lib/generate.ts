import { supabase, STORAGE_BUCKET, getPublicImageUrl } from './supabase';
import { fileToImage } from './image';
import { renderPfp } from './renderPfp';
import { renderCard } from './renderCard';
import { generateBuilderTitle, SHARE_CAPTION, HASHTAG } from './builderTitles';

export type GraphicFormat = 'pfp' | 'card';

export interface GenerateResult {
  id: string;
  blob: Blob;
  dataUrl: string;
  shareUrl: string;
  imageUrl: string;
  caption: string;
  format: GraphicFormat;
}

export interface CardInput {
  name: string;
  stack: string;
}

// Renders the graphic on a canvas, uploads the PNG to storage, inserts a
// row in the graphics table, and returns everything the UI needs.
export async function generateGraphic(
  file: File,
  format: GraphicFormat,
  cardInput?: CardInput,
): Promise<GenerateResult> {
  // 1. Load + decode the uploaded photo (handles HEIC conversion).
  const img = await fileToImage(file);

  // 2. Render to canvas at production resolution.
  const W = format === 'pfp' ? 1024 : 1600;
  const H = format === 'pfp' ? 1024 : 900;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  let title = '';
  let name = '';
  let stack = '';

  if (format === 'pfp') {
    renderPfp(ctx, img);
  } else {
    name = cardInput?.name?.trim() || '';
    stack = cardInput?.stack?.trim() || '';
    title = generateBuilderTitle(name, stack);
    await renderCard(ctx, img, name, stack, title);
  }

  // 3. Export as PNG blob.
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to export image'))),
      'image/png',
      0.95,
    );
  });

  const dataUrl = canvas.toDataURL('image/png');

  // 4. Generate ID and upload to Supabase storage.
  const id = crypto.randomUUID();
  const imagePath = `${id}.png`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(imagePath, blob, { contentType: 'image/png' });

  if (uploadError) throw uploadError;

  const imageUrl = getPublicImageUrl(imagePath);

  // 5. Build the share caption.
  const captionBody = SHARE_CAPTION(format, name || undefined);
  const caption = `${captionBody}${HASHTAG}`;

  // 6. Insert graphics row so the edge function can serve OG tags.
  const { error: dbError } = await supabase.from('graphics').insert({
    id,
    format,
    name: format === 'card' ? name : null,
    stack: format === 'card' ? stack : null,
    title: format === 'card' ? title : null,
    caption,
    image_path: imagePath,
  });

  if (dbError) throw dbError;

  // The share URL is the edge function endpoint, which serves an HTML page
  // with OG meta tags pointing to the uploaded image.
  const fnBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share`;
  const shareUrl = `${fnBase}/${id}`;

  return { id, blob, dataUrl, shareUrl, imageUrl, caption, format };
}