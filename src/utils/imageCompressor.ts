/**
 * Client-side image compression utility for Firebase Firestore & localStorage compatibility.
 * Ensures uploaded photos from phones/PCs (often 2-10MB) are resized and compressed
 * to lightweight Data URLs (~45KB-110KB) so Firestore writes never hit the 1MB doc limit.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  preserveTransparency?: boolean;
  /** Maximum target base64 string length (default 115_000 chars ≈ 85KB binary) */
  maxBase64Length?: number;
}

export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1080,
    maxHeight = 810,
    quality = 0.76,
    preserveTransparency = false,
    maxBase64Length = 115_000,
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
  const img = await loadImage(rawDataUrl);

  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;

  if (targetWidth <= 0 || targetHeight <= 0) {
    throw new Error('Không thể đọc kích thước ảnh. Vui lòng thử file PNG hoặc JPG khác.');
  }

  const widthRatio = maxWidth / targetWidth;
  const heightRatio = maxHeight / targetHeight;
  const scale = Math.min(1, widthRatio, heightRatio);

  targetWidth = Math.max(1, Math.round(targetWidth * scale));
  targetHeight = Math.max(1, Math.round(targetHeight * scale));

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

  if (preserveTransparency && (file.type === 'image/png' || file.type === 'image/webp')) {
    const webp = canvas.toDataURL('image/webp', 0.85);
    if (webp.startsWith('data:image/webp') && webp.length <= maxBase64Length) {
      return webp;
    }
    const png = canvas.toDataURL('image/png');
    if (png.length <= Math.max(maxBase64Length, 180_000)) {
      return png;
    }
    // Scale down further if transparent PNG is still large
    canvas.width = Math.max(1, Math.round(targetWidth * 0.65));
    canvas.height = Math.max(1, Math.round(targetHeight * 0.65));
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const smallWebp = canvas.toDataURL('image/webp', 0.8);
    if (smallWebp.startsWith('data:image/webp') && smallWebp.length <= maxBase64Length) {
      return smallWebp;
    }
    return canvas.toDataURL('image/png');
  }

  // Adaptive JPEG compression loop so image always fits comfortably under Firestore limits
  let currentQuality = quality;
  let output = canvas.toDataURL('image/jpeg', currentQuality);

  while (output.length > maxBase64Length && currentQuality > 0.48) {
    currentQuality = Math.max(0.46, currentQuality - 0.12);
    output = canvas.toDataURL('image/jpeg', currentQuality);
  }

  // If still above target size after lowering quality, step down dimensions slightly
  if (output.length > maxBase64Length) {
    canvas.width = Math.max(1, Math.round(targetWidth * 0.76));
    canvas.height = Math.max(1, Math.round(targetHeight * 0.76));
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    output = canvas.toDataURL('image/jpeg', 0.62);
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

export function extractReadableFirebaseError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err || '');
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.error === 'string') {
      const inner = parsed.error;
      if (inner.includes('exceeds the maximum allowed size')) {
        return 'Ảnh quá nặng vượt giới hạn 1MB của Firebase. Anh hãy chọn ảnh nhẹ hơn hoặc dán link URL nhé!';
      }
      if (inner.includes('permission-denied') || inner.includes('Missing or insufficient permissions')) {
        return 'Firebase từ chối quyền ghi (Permission Denied). Anh kiểm tra lại cấu hình Firestore Rules.';
      }
      if (inner.includes('offline') || inner.includes('network')) {
        return 'Không có kết nối mạng tới máy chủ Firebase. Anh vui lòng thử lại sau.';
      }
      return `Lỗi đồng bộ Firebase: ${inner}`;
    }
  } catch {
    // not JSON
  }
  return raw || 'Không thể lưu dữ liệu lên Firebase, anh vui lòng thử lại!';
}
