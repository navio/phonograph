import { createTheme, Theme } from "@mui/material/styles";
import deepOrange from "@mui/material/colors/deepOrange";
import blue from "@mui/material/colors/blue";
import { PaletteMode } from "@mui/material";

const base = {
  typography: {
    fontSize: 12,
  },
};

export type ThemeName = "default" | "nord" | "dracula" | "highContrast";

export const prefersDark = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const createAppTheme = (name: ThemeName = "default", mode: PaletteMode = "light"): Theme => {
  const palettes: Record<ThemeName, { light: any; dark: any }> = {
    default: {
      light: {
        mode: "light",
        primary: blue,
        secondary: deepOrange,
      },
      dark: {
        mode: "dark",
        // Vercel-inspired dark palette
        background: { default: "#0a0a0a", paper: "#111111" },
        text: { primary: "#ffffff", secondary: "#a1a1aa" },
        divider: "#27272a",
        primary: { main: "#0070f3", contrastText: "#ffffff" },
        // Keep secondary accent minimal / neutral
        secondary: { main: "#a1a1aa", contrastText: "#0a0a0a" },
        action: {
          hover: "rgba(255,255,255,0.04)",
          selected: "rgba(255,255,255,0.08)",
          disabled: "rgba(255,255,255,0.3)",
          disabledBackground: "rgba(255,255,255,0.12)",
        },
      },
    },

    nord: {
      light: {
        mode: "light",
        primary: { main: "#5E81AC", contrastText: "#ffffff" },
        secondary: { main: "#88C0D0", contrastText: "#ffffff" },
        background: { default: "#ECEFF4", paper: "#E5E9F0" },
        text: { primary: "#2E3440" },
      },
      dark: {
        mode: "dark",
        primary: { main: "#81A1C1", contrastText: "#ffffff" },
        secondary: { main: "#88C0D0", contrastText: "#ffffff" },
        background: { default: "#2E3440", paper: "#3B4252" },
        text: { primary: "#D8DEE9" },
      },
    },

    dracula: {
      light: {
        mode: "light",
        primary: { main: "#BD93F9", contrastText: "#ffffff" },
        secondary: { main: "#8BE9FD", contrastText: "#000000" },
        background: { default: "#F8F8F2", paper: "#FFFFFF" },
        text: { primary: "#282A36" },
      },
      dark: {
        mode: "dark",
        primary: { main: "#BD93F9", contrastText: "#ffffff" },
        secondary: { main: "#FF79C6", contrastText: "#ffffff" },
        background: { default: "#282A36", paper: "#44475A" },
        text: { primary: "#F8F8F2" },
      },
    },

    highContrast: {
      light: {
        mode: "light",
        primary: { main: "#000000", contrastText: "#ffffff" },
        secondary: { main: "#000000", contrastText: "#ffffff" },
        background: { default: "#ffffff", paper: "#ffffff" },
        text: { primary: "#000000" },
      },
      dark: {
        mode: "dark",
        primary: { main: "#ffffff", contrastText: "#000000" },
        secondary: { main: "#ffffff", contrastText: "#000000" },
        background: { default: "#000000", paper: "#000000" },
        text: { primary: "#ffffff" },
      },
    },
  };

  const paletteConfig = mode === "dark" ? palettes[name].dark : palettes[name].light;

  return createTheme({ ...base, palette: paletteConfig as any });
};

export default createAppTheme;
