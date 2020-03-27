import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import Favorite from "@material-ui/icons/Favorite"; //Headsert
import FavoriteIcon from "@material-ui/icons/Search";
import Settings from "@material-ui/icons/Settings";
import Paper from "@material-ui/core/Paper";
import { withRouter } from "react-router-dom";
const styles = {
  root: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },
  underground: {
    height: 48,
    width: "100%",
  },
};

class SimpleBottomNavigation extends React.Component {
  handleRedirect(url) {
    return () => this.props.history.push(url);
  }
  render() {
    const classes = this.props.classes;
    const selected = this.props.path.substring(1) || "library";
    return (
      <div>
        <Paper className={classes.root} elevation={4}>
          <BottomNavigation
            value={selected}
            onChange={this.handleChange}
            showLabels
            className={classes.root}
          >
            <BottomNavigationAction
              label="Library"
              value="library"
              onClick={this.handleRedirect("/")}
              icon={<Favorite />}
            />
            <BottomNavigationAction
              label="Search"
              value="discover"
              onClick={this.handleRedirect("/discover")}
              icon={<FavoriteIcon />}
            />
            <BottomNavigationAction
              label="Settings"
              value="settings"
              onClick={this.handleRedirect("/settings")}
              icon={<Settings />}
            />
          </BottomNavigation>
        </Paper>
        <div className={classes.underground} />
      </div>
    );
  }
}

SimpleBottomNavigation.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(withRouter(SimpleBottomNavigation));
