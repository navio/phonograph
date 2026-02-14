import { createTheme, Theme } from "@mui/material/styles";
import deepOrange from "@mui/material/colors/deepOrange";
import blue from "@mui/material/colors/blue";

const os =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const base = {
  typography: {
    fontSize: 12,
  },
};

const light: Theme = createTheme({
  ...base,
  palette: {
    mode: "light",
    primary: blue,
    secondary: deepOrange,
  },
});

const dark: Theme = createTheme({
  ...base,
  palette: {
    mode: "dark",
    primary: blue,
    secondary: deepOrange,
  },
});

const theme = { dark, light, os };

export default theme;
