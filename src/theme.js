import { createTheme } from "@mui/material/styles";
import deepOrange from "@mui/material/colors/deepOrange";
import blue from "@mui/material/colors/blue";

const os =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const base = {
  typography: {
    fontSize: 12,
  },
};

const light = createTheme({
  ...base,
  palette: {
    mode: "light",
    primary: blue,
    secondary: deepOrange,
  },
});

const dark = createTheme({
  ...base,
  palette: {
    mode: "dark",
    primary: blue,
    secondary: deepOrange,
  },
});

export default { dark, light, os };
