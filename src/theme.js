import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { deepOrange, blue } from '@mui/material/colors';

const os =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const base = {
  typography: {
    fontSize: 12,
  },
};

const light = createTheme(adaptV4Theme({ ...base, ...{
  palette: {
    mode: "light",
    primary: blue,
    secondary: deepOrange,
  },
}}));

const dark = createTheme(adaptV4Theme({ ...base, ...{
  palette: {
    mode: "dark",
    primary: blue,
    secondary: deepOrange,
  },
}}));

export default { dark, light, os };
