/**
 * Client-side image compression utility for Firebase Firestore & localStorage compatibility.
 * Ensures uploaded photos from phones/PCs (often 2-10MB) are resized and compressed
 * to lightweight Data URLs (~40KB-120KB) so Firestore writes never hit the 1MB doc limit.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  preserveTransparency?: boolean;
}

export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 900,
    quality = 0.78,
    preserveTransparency = false,
  } = options;

  // Preserve animated GIFs as-is if small enough for Firestore
  if (file.type === 'image/gif') {
    if (file.size > 480 * 1024) {
      throw new Error(
        'File GIF quá nặng (>480KB) nên không thể lưu trực tiếp lên Firebase. Anh vui lòng nén GIF nhẹ hơn hoặc dán đường link ảnh (URL) nhé!'
      );
    }
    return readFileAsDataURL(file);
  }

  // Keep tiny SVG files intact
  if (file.type === 'image/svg+xml') {
    if (file.size > 200 * 1024) {
      throw new Error('File SVG quá nặng (>200KB). Anh vui lòng chọn file nhẹ hơn hoặc PNG/JPG.');
    }
    return readFileAsDataURL(file);
  }

  const rawDataUrl = await readFileAsDataURL(file);

  // If already very small (< 90KB), no heavy canvas recompression needed unless oversized dimensions
  const img = await loadImage(rawDataUrl);

  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;

  if (targetWidth <= 0 || targetHeight <= 0) {
    throw new Error('Không thể đọc kích thước ảnh. Vui lòng thử file PNG hoặc JPG khác.');
  }

  const widthRatio = maxWidth / targetWidth;
  const heightRatio = maxHeight / targetHeight;
  const scale = Math.min(1, widthRatio, heightRatio);

  targetWidth = Math.round(targetWidth * scale);
  targetHeight = Math.round(targetHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return rawDataUrl;
  }

  if (!preserveTransparency) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  if (preserveTransparency && file.type === 'image/png') {
    // Try WebP with alpha first (much smaller than PNG), fallback to PNG
    const webp = canvas.toDataURL('image/webp', 0.85);
    if (webp.startsWith('data:image/webp') && webp.length < 180_000) {
      return webp;
    }
    const png = canvas.toDataURL('image/png');
    if (png.length < 220_000) {
      return png;
    }
    // Scale down further if PNG is still large
    canvas.width = Math.round(targetWidth * 0.65);
    canvas.height = Math.round(targetHeight * 0.65);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  }

  let output = canvas.toDataURL('image/jpeg', quality);

  // If still > 180KB base64 (~135KB binary), lower quality slightly
  if (output.length > 180_000) {
    output = canvas.toDataURL('image/jpeg', Math.max(0.55, quality - 0.18));
  }

  return output;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Không thể đọc file ảnh.'));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc file từ thiết bị.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('File ảnh không hợp lệ hoặc bị hỏng.'));
    img.src = src;
  });
}

export function estimateUtf8Bytes(data: unknown): number {
  try {
    const json = JSON.stringify(data);
    return new Blob([json]).size;
  } catch {
    return 0;
  }
}
