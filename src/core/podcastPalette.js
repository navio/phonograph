import ColorThief from "colorthief";

const paletteCache = new Map();
const thief = new ColorThief();
const DEFAULT_COLOR = [32, 32, 32];
const WHITE = [255, 255, 255];
const BLACK = [12, 12, 12];
const DEFAULT_THEME = {
  primary: "rgba(255,255,255,0.95)",
  secondary: "rgba(245,245,245,0.7)",
  accent: "rgba(20,20,20,0.95)",
  text: "rgb(15,15,15)",
  subText: "rgb(70,70,70)",
};

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

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const mix = (color, target, amount) => {
  const t = clamp(amount, 0, 1);
  return [
    Math.round(color[0] + (target[0] - color[0]) * t),
    Math.round(color[1] + (target[1] - color[1]) * t),
    Math.round(color[2] + (target[2] - color[2]) * t),
  ];
};

const luminance = (color = DEFAULT_COLOR) => {
  const [r, g, b] = color.map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (a, b) => {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [bright, dark] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (bright + 0.05) / (dark + 0.05);
};

const bestTextColor = (background, candidates) =>
  candidates.reduce((best, current) =>
    contrastRatio(current, background) > contrastRatio(best, background)
      ? current
      : best
  , candidates[0] || BLACK);

const pickDarkest = (colors = []) =>
  colors.reduce((darkest, current) =>
    luminance(current) < luminance(darkest) ? current : darkest
  , colors[0] || DEFAULT_COLOR);

const pickLightest = (colors = []) =>
  colors.reduce((lightest, current) =>
    luminance(current) > luminance(lightest) ? current : lightest
  , colors[0] || DEFAULT_COLOR);

const ensureBackground = (color, colors = []) => {
  const lum = luminance(color);
  if (lum > 0.85) {
    return mix(pickDarkest(colors), BLACK, 0.2);
  }
  if (lum < 0.08) {
    return mix(pickLightest(colors), WHITE, 0.15);
  }
  return color;
};

const ensureAccent = (accent, background, colors = []) => {
  const bgLum = luminance(background);
  const accentLum = luminance(accent);
  const diff = Math.abs(bgLum - accentLum);
  if (diff < 0.2) {
    return bgLum > 0.5
      ? mix(pickDarkest(colors), BLACK, 0.05)
      : mix(pickLightest(colors), WHITE, 0.05);
  }
  return accent;
};

const ensureText = (background, colors = []) => {
  const candidate = bestTextColor(background, [
    mix(pickLightest(colors), WHITE, 0.1),
    mix(pickDarkest(colors), BLACK, 0.15),
    WHITE,
    BLACK,
  ]);
  const ratio = contrastRatio(candidate, background);
  if (ratio < 4.5) {
    return bestTextColor(background, [BLACK, WHITE]);
  }
  return candidate;
};

export const buildThemeFromPalette = (palette) => {
  if (!palette || !palette.colors || palette.colors.length === 0) return DEFAULT_THEME;
  const colors = palette.colors || [];
  const primaryBase = ensureBackground(palette.primary, colors);
  const secondaryBase = ensureBackground(palette.secondary, colors);
  const accentBase = ensureAccent(palette.accent, primaryBase, colors);
  const text = ensureText(primaryBase, colors);
  const subText = mix(text, primaryBase, 0.35);

  return {
    primary: toRGBA(primaryBase, 0.92),
    secondary: toRGBA(secondaryBase, 0.65),
    accent: toRGBA(accentBase, 0.95),
    text: toRGB(text),
    subText: toRGB(subText),
  };
};

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
