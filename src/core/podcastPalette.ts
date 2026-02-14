import ColorThief from "colorthief";

type RGB = [number, number, number];

export interface Palette {
  colors: RGB[];
  primary: RGB;
  secondary: RGB;
  accent: RGB;
}

export interface PaletteTheme {
  primary: string;
  secondary: string;
  accent: string;
  accentText: string;
  text: string;
  subText: string;
}

const paletteCache = new Map<string, Palette | null>();
const thief = new ColorThief();
const DEFAULT_COLOR: RGB = [32, 32, 32];
const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [12, 12, 12];
const DEFAULT_THEME: PaletteTheme = {
  primary: "rgb(255,255,255)",
  secondary: "rgb(245,245,245)",
  accent: "rgb(20,20,20)",
  accentText: "rgb(255,255,255)",
  text: "rgb(15,15,15)",
  subText: "rgb(70,70,70)",
};
const MIN_TEXT_CONTRAST = 7;

const isLightColor = (color: RGB = DEFAULT_COLOR) => {
  const [red, green, blue] = color;
  const total = red * 0.299 + green * 0.587 + blue * 0.114;
  return total > 186;
};

export const toRGB = (color: RGB = DEFAULT_COLOR) =>
  `rgb(${color[0]},${color[1]},${color[2]})`;

export const toRGBA = (color: RGB = DEFAULT_COLOR, a = 0.85) =>
  `rgba(${color[0]},${color[1]},${color[2]}, ${a})`;

export const getContrastText = (
  color: RGB = DEFAULT_COLOR,
  dark = "#0d0d0d",
  light = "#ffffff"
) =>
  isLightColor(color) ? dark : light;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const mix = (color: RGB, target: RGB, amount: number): RGB => {
  const t = clamp(amount, 0, 1);
  return [
    Math.round(color[0] + (target[0] - color[0]) * t),
    Math.round(color[1] + (target[1] - color[1]) * t),
    Math.round(color[2] + (target[2] - color[2]) * t),
  ];
};

const luminance = (color: RGB = DEFAULT_COLOR) => {
  const [r, g, b] = color.map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (a: RGB, b: RGB) => {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [bright, dark] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (bright + 0.05) / (dark + 0.05);
};

const bestTextColor = (background: RGB, candidates: RGB[]) =>
  candidates.reduce(
    (best, current) =>
      contrastRatio(current, background) > contrastRatio(best, background)
        ? current
        : best,
    candidates[0] || BLACK
  );

const pickDarkest = (colors: RGB[] = []) =>
  colors.reduce((darkest, current) =>
    luminance(current) < luminance(darkest) ? current : darkest
  , colors[0] || DEFAULT_COLOR);

const pickLightest = (colors: RGB[] = []) =>
  colors.reduce((lightest, current) =>
    luminance(current) > luminance(lightest) ? current : lightest
  , colors[0] || DEFAULT_COLOR);

const ensureBackground = (color: RGB, colors: RGB[] = []) => {
  const lum = luminance(color);
  if (lum > 0.85) {
    return mix(pickDarkest(colors), BLACK, 0.2);
  }
  if (lum < 0.08) {
    return mix(pickLightest(colors), WHITE, 0.15);
  }
  return color;
};

const ensureAccent = (accent: RGB, background: RGB, colors: RGB[] = []) => {
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

const ensureText = (background: RGB, colors: RGB[] = []) => {
  if (luminance(background) > 0.85) {
    return mix(pickDarkest(colors), BLACK, 0.1);
  }
  const candidate = bestTextColor(background, [
    mix(pickLightest(colors), WHITE, 0.1),
    mix(pickDarkest(colors), BLACK, 0.15),
    WHITE,
    BLACK,
  ]);
  const ratio = contrastRatio(candidate, background);
  if (ratio < MIN_TEXT_CONTRAST) {
    return bestTextColor(background, [BLACK, WHITE]);
  }
  return candidate;
};

export const buildThemeFromPalette = (palette: Palette | null): PaletteTheme => {
  if (!palette || !palette.colors || palette.colors.length === 0) return DEFAULT_THEME;
  const colors = palette.colors || [];
  let primaryBase = ensureBackground(palette.primary, colors);
  let secondaryBase = ensureBackground(palette.secondary, colors);
  let accentBase = ensureAccent(palette.accent, primaryBase, colors);
  let text = ensureText(primaryBase, colors);
  let subText = mix(text, primaryBase, 0.25);

  // If contrast is still low, bias the background away from the text.
  if (contrastRatio(text, primaryBase) < MIN_TEXT_CONTRAST) {
    const target = luminance(text) > 0.5 ? BLACK : WHITE;
    primaryBase = mix(primaryBase, target, 0.35);
    secondaryBase = mix(secondaryBase, target, 0.2);
    accentBase = ensureAccent(accentBase, primaryBase, colors);
    text = ensureText(primaryBase, colors);
    subText = mix(text, primaryBase, 0.25);
  }

  const accentText = bestTextColor(accentBase, [BLACK, WHITE]);

  return {
    primary: toRGB(primaryBase),
    secondary: toRGB(secondaryBase),
    accent: toRGB(accentBase),
    accentText: toRGB(accentText),
    text: toRGB(text),
    subText: toRGB(subText),
  };
};

const normalizePalette = (colors: RGB[] = []): Palette => {
  const primary = colors[0] || DEFAULT_COLOR;
  const secondary = colors[1] || primary;
  const accent = colors[2] || secondary;
  return { colors, primary, secondary, accent };
};

export const getImagePalette = (url: string | null): Promise<Palette | null> => {
  if (!url) return Promise.resolve(null);
  if (paletteCache.has(url)) return Promise.resolve(paletteCache.get(url) || null);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.referrerPolicy = "no-referrer";
    img.decoding = "async";

    img.onload = () => {
      try {
        const colors = thief.getPalette(img, 4) || [];
        const palette = normalizePalette(colors as RGB[]);
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
