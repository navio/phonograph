import ColorThief from "colorthief";

const paletteCache = new Map();
const thief = new ColorThief();
const DEFAULT_COLOR = [32, 32, 32];

const isLightColor = (color = DEFAULT_COLOR) => {
  const [red, green, blue] = color;
  const total = red * 0.299 + green * 0.587 + blue * 0.114;
  return total > 186;
};

export const toRGB = (color = DEFAULT_COLOR) =>
  `rgb(${color[0]},${color[1]},${color[2]})`;

export const toRGBA = (color = DEFAULT_COLOR, a = 0.85) =>
  `rgba(${color[0]},${color[1]},${color[2]}, ${a})`;

export const getContrastText = (color = DEFAULT_COLOR, dark = "#0d0d0d", light = "#ffffff") =>
  isLightColor(color) ? dark : light;

const normalizePalette = (colors = []) => {
  const primary = colors[0] || DEFAULT_COLOR;
  const secondary = colors[1] || primary;
  const accent = colors[2] || secondary;
  return { colors, primary, secondary, accent };
};

export const getImagePalette = (url) => {
  if (!url) return Promise.resolve(null);
  if (paletteCache.has(url)) return Promise.resolve(paletteCache.get(url));

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.referrerPolicy = "no-referrer";
    img.decoding = "async";

    img.onload = () => {
      try {
        const colors = thief.getPalette(img, 4) || [];
        const palette = normalizePalette(colors);
        paletteCache.set(url, palette);
        resolve(palette);
      } catch (error) {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = url;
  });
};
