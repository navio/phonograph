import { createMuiTheme } from "@material-ui/core/styles";
import deepOrange from "@material-ui/core/colors/deepOrange";
import blue from "@material-ui/core/colors/blue";
import useMediaQuery from '@material-ui/core/useMediaQuery';


const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;


const theme = createMuiTheme({
    palette: {
      type: prefersDarkMode ? 'dark' : 'light',
      primary: blue,
      secondary: deepOrange,
    },
});

export default theme;
