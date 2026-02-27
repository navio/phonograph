import { createTheme, Theme } from "@mui/material/styles";
import deepOrange from "@mui/material/colors/deepOrange";
import blue from "@mui/material/colors/blue";
import { PaletteMode } from "@mui/material";

const base = {
  typography: {
    fontSize: 12,
  },
};

export type ThemeName = "default" | "nord" | "dracula" | "highContrast" | "matrix" | "monokai" | "solarized";

export const prefersDark = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const createAppTheme = (name: ThemeName = "nord", mode: PaletteMode = "light"): Theme => {
  const palettes: Record<ThemeName, { light: any; dark: any }> = {
    default: {
      light: {
        mode: "light",
        primary: blue,
        secondary: deepOrange,
      },
      dark: {
        mode: "dark",
        primary: blue,
        secondary: deepOrange,
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

    matrix: {
      light: {
        mode: "light",
        primary: { main: "#0B8457", contrastText: "#ffffff" },
        secondary: { main: "#2E7D32", contrastText: "#ffffff" },
        background: { default: "#F5FBF6", paper: "#FFFFFF" },
        text: { primary: "#0A0A0A" },
      },
      dark: {
        mode: "dark",
        primary: { main: "#00FF41", contrastText: "#000000" },
        secondary: { main: "#33FF77", contrastText: "#000000" },
        background: { default: "#000000", paper: "#07120A" },
        text: { primary: "#B6FFC8" },
      },
    },

    monokai: {
      light: {
        mode: "light",
        primary: { main: "#F92672", contrastText: "#000000" },
        secondary: { main: "#A6E22E", contrastText: "#000000" },
        background: { default: "#F5F5F5", paper: "#FFFFFF" },
        text: { primary: "#2E2E2E" },
      },
      dark: {
        mode: "dark",
        primary: { main: "#F92672", contrastText: "#ffffff" },
        secondary: { main: "#A6E22E", contrastText: "#ffffff" },
        background: { default: "#272822", paper: "#2F312B" },
        text: { primary: "#F8F8F2" },
      },
    },

    solarized: {
      light: {
        mode: "light",
        primary: { main: "#268BD2", contrastText: "#ffffff" },
        secondary: { main: "#2AA198", contrastText: "#ffffff" },
        background: { default: "#FDF6E3", paper: "#EEE8D5" },
        text: { primary: "#657B83" },
      },
      dark: {
        mode: "dark",
        primary: { main: "#268BD2", contrastText: "#ffffff" },
        secondary: { main: "#2AA198", contrastText: "#ffffff" },
        background: { default: "#002B36", paper: "#073642" },
        text: { primary: "#839496" },
      },
    },
  };

  const paletteConfig = mode === "dark" ? palettes[name].dark : palettes[name].light;

  return createTheme({ ...base, palette: paletteConfig as any });
};

export default createAppTheme;
