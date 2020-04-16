import { createMuiTheme } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";
import blue from "@material-ui/core/colors/blue";

const theme = createMuiTheme({
  palette: {
    primary: red,
    secondary: blue,
  },
});

export default theme;
