const THUMB_CACHE_KEY = "podcast-grid-thumbnails-v1";
const TILE_SIZE = 112;
const TILE_QUALITY = 0.72;

type ThumbCache = Record<string, string>;

const safeReadCache = (): ThumbCache => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return {};
    const raw = window.localStorage.getItem(THUMB_CACHE_KEY);
    if (!raw) return {};
    return (JSON.parse(raw) as ThumbCache) || {};
  } catch {
    return {};
  }
};

const safeWriteCache = (cache: ThumbCache) => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(THUMB_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore quota and privacy mode write failures.
  }
};

const readImageFromBlob = async (blob: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to decode image blob"));
    };
    image.src = objectUrl;
  });
};

const renderSquareThumbnail = (image: HTMLImageElement): string | null => {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) return null;

  const cropSize = Math.min(sourceWidth, sourceHeight);
  const sourceX = (sourceWidth - cropSize) / 2;
  const sourceY = (sourceHeight - cropSize) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = TILE_SIZE;
  canvas.height = TILE_SIZE;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, TILE_SIZE, TILE_SIZE);

  return canvas.toDataURL("image/webp", TILE_QUALITY);
};

export const getCachedGridImage = (cacheKey: string): string | null => {
  if (!cacheKey) return null;
  const cache = safeReadCache();
  return cache[cacheKey] || null;
};

export const buildGridImage = async (imageUrl?: string | null): Promise<string | null> => {
  if (!imageUrl || typeof window === "undefined") return null;

  const res = await fetch(imageUrl, { mode: "cors", cache: "force-cache" });
  if (!res.ok) return null;

  const blob = await res.blob();
  const image = await readImageFromBlob(blob);
  return renderSquareThumbnail(image);
};

export const getOrCreateGridImage = async (cacheKey: string, imageUrl?: string | null): Promise<string | null> => {
  if (!cacheKey || !imageUrl) return null;

  const existing = getCachedGridImage(cacheKey);
  if (existing) return existing;

  try {
    const thumb = await buildGridImage(imageUrl);
    if (!thumb) return null;

    const cache = safeReadCache();
    cache[cacheKey] = thumb;
    safeWriteCache(cache);
    return thumb;
  } catch {
    return null;
  }
};
