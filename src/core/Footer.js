import React, { useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import Badge from "@material-ui/core/Badge";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import Favorite from "@material-ui/icons/Bookmark"; //Headsert
import DiscoverIcon from "@material-ui/icons/FilterDrama";
import Settings from "@material-ui/icons/Settings";
import Playlist from "@material-ui/icons/PlaylistPlay";
import Paper from "@material-ui/core/Paper";
import { withRouter } from "react-router-dom";
import { LIBVIEW, DISCOVERVIEW, SETTINGSVIEW, PLAYLIST } from "../constants";

import { AppContext } from "../App.js";

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

const StyledBadge = withStyles((theme) => ({
  badge: {
    right: -3,
    top: 5,

  },
}))(Badge);

const hotkeys = (redirects) => {
  document.body.addEventListener('keyup',(ev)=> {
    const {target, key} = ev;
      if(document.body == target){
        switch(key){
          case "f":
          case "l":
            redirects(LIBVIEW)
          break;
          case "p":
            redirects(PLAYLIST)
          break;
          case "d":
            redirects(DISCOVERVIEW)
          break;
          case "/":
            redirects(DISCOVERVIEW);
            document.getElementById('outlined-search').focus();
          break;
          case "s":
            redirects(SETTINGSVIEW)
          break;

        }
      }
  })
};

const SimpleBottomNavigation = ({ history, classes, location }) => {
  const handleRedirect = (url) => {
    return () => history.push(url);
  };
  useEffect(() => hotkeys((url) => history.push(url)) ,[])
  
  const { state } = useContext(AppContext);
  const amount = (state.playlist && state.playlist.length) || 0;
  const selected =
    location.pathname.length > 2 ? location.pathname : DISCOVERVIEW;
  return (
    <div>
      <Paper className={classes.root} elevation={4}>
        <BottomNavigation value={selected} showLabels className={classes.root}>
          <BottomNavigationAction
            label="Favorites"
            value={LIBVIEW}
            onClick={handleRedirect(LIBVIEW)}
            icon={<Favorite />}
          />
          <BottomNavigationAction
            label="Playlist"
            value={PLAYLIST}
            onClick={handleRedirect(PLAYLIST)}
            icon={
              <StyledBadge badgeContent={amount} color="secondary">
                <Playlist />
              </StyledBadge>
            }
          />
          <BottomNavigationAction
            label="Discover"
            value={DISCOVERVIEW}
            onClick={handleRedirect(DISCOVERVIEW)}
            icon={<DiscoverIcon />}
          />
          <BottomNavigationAction
            label="Settings"
            value={SETTINGSVIEW}
            onClick={handleRedirect(SETTINGSVIEW)}
            icon={<Settings />}
          />
        </BottomNavigation>
      </Paper>
      <div className={classes.underground} />
    </div>
  );
};

SimpleBottomNavigation.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(withRouter(SimpleBottomNavigation));
