import { createMuiTheme } from "@material-ui/core/styles";
import deepOrange from "@material-ui/core/colors/deepOrange";
import blue from "@material-ui/core/colors/blue";


const os = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const light = createMuiTheme({
    palette: {
      type: 'light',
      primary: blue,
      secondary: deepOrange,
    },
});


const dark = createMuiTheme({
  palette: {
    type: 'dark',
    primary: blue,
    secondary: deepOrange,
  },
});

export default {dark, light, os};
