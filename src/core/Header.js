import React from "react";
import PropTypes from "prop-types";
import withStyles from '@mui/styles/withStyles';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
// import Button from '@mui/material/Button';
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

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
              size="large">
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
