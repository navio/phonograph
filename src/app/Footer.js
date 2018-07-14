import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import Headset from "@material-ui/icons/Headset";
import FavoriteIcon from "@material-ui/icons/Favorite";
import Ballot from "@material-ui/icons/Dvr";
import Paper from "@material-ui/core/Paper";
import { Link } from "react-router-dom";
import { withRouter } from "react-router-dom";
const styles = {
  root: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)"
  },
  underground: {
    height: 48,
    width: "100%"
  }
};

class SimpleBottomNavigation extends React.Component {
  handleRedirect(url) {
    return () => this.props.history.push(url);
  }
  render() {
    const { classes } = this.props;

    return (
      <div>
        <Paper className={classes.root} elevation={4}>
          <BottomNavigation
            onChange={this.handleChange}
            showLabels
            className={classes.root}
          >
            <BottomNavigationAction
              label="Podcasts"
              onClick={this.handleRedirect('/')}
              icon={<Headset />}
            />
            <BottomNavigationAction
              label="Discover"
              onClick={this.handleRedirect('/discover')}
              icon={<FavoriteIcon />}
            />
            <BottomNavigationAction
              label="Settings"
              onClick={this.handleRedirect('settings')}
              icon={<Ballot />}
            />
          </BottomNavigation>
        </Paper>
        <div className={classes.underground} />
      </div>
    );
  }
}

SimpleBottomNavigation.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(SimpleBottomNavigation));
