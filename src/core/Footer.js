import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import Favorite from "@material-ui/icons/Bookmark"; //Headsert
import DiscoverIcon from "@material-ui/icons/FilterDrama";
import Settings from "@material-ui/icons/Settings";
import Paper from "@material-ui/core/Paper";
import { withRouter } from "react-router-dom";
import { ROOT, LIBVIEW, PODCASTVIEW, DISCOVERVIEW, SETTINGSVIEW } from "../constants";
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
    const selected = this.props.location.pathname.length > 2 ?
    this.props.location.pathname : LIBVIEW;
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
              value={LIBVIEW}
              onClick={this.handleRedirect(LIBVIEW)}
              icon={<Favorite />}
            />
            <BottomNavigationAction
              label="Discover"
              value={DISCOVERVIEW}
              onClick={this.handleRedirect(DISCOVERVIEW)}
              icon={<DiscoverIcon />}
            />
            <BottomNavigationAction
              label="Settings"
              value={SETTINGSVIEW}
              onClick={this.handleRedirect(SETTINGSVIEW)}
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
