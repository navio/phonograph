import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
// import Button from '@material-ui/core/Button';
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";

const styles = {
  root: {
    position: "fixed",
    top: 0,
    width: "100%",
    margin: 0,
    zIndex: 4000,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  behindButton: {
    paddingTop: 62,
  },
};

function NavigationApp(props) {
  const { classes } = props;
  return (
    <div>
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              className={classes.menuButton}
              color="inherit"
              aria-label="Menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h2"
              color="inherit"
              className={classes.flex}
            >
              Podcast
            </Typography>
            {/* <Button color="inherit">Login</Button> */}
          </Toolbar>
        </AppBar>
      </div>
      <div className={classes.behindButton}></div>
    </div>
  );
}

NavigationApp.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NavigationApp);
