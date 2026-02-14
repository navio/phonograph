import React, { useContext, useEffect } from "react";
import { styled } from "@mui/material/styles";
import BottomNavigation from "@mui/material/BottomNavigation";
import Badge from "@mui/material/Badge";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Favorite from "@mui/icons-material/Bookmark";
import DiscoverIcon from "@mui/icons-material/FilterDrama";
import Settings from "@mui/icons-material/Settings";
import Playlist from "@mui/icons-material/PlaylistPlay";
import Paper from "@mui/material/Paper";
import { useHistory, useLocation } from "react-router-dom";
import { LIBVIEW, DISCOVERVIEW, SETTINGSVIEW, PLAYLIST } from "../constants";

import { AppContext } from "../App";
import { AppContextValue } from "../types/app";

const StyledBottomNavigationAction = styled(BottomNavigationAction)({
  "& .MuiBottomNavigationAction-label": {
    fontSize: ".8rem",
  },
  "&.Mui-selected .MuiBottomNavigationAction-label": {
    fontSize: ".8rem",
  },
});

const StyledBadge = styled(Badge)({
  "& .MuiBadge-badge": {
    right: -3,
    top: 5,
  },
});

const hotkeys = (redirects: (url: string) => void) => {
  const handler = (ev: KeyboardEvent) => {
    const { target, key } = ev;
    if (document.body === target) {
      switch (key) {
        case "f":
        case "l":
          redirects(LIBVIEW);
          break;
        case "p":
          redirects(PLAYLIST);
          break;
        case "d":
          redirects(DISCOVERVIEW);
          break;
        case "/":
          redirects(DISCOVERVIEW);
          document.getElementById("outlined-search")?.focus();
          break;
        case "s":
          redirects(SETTINGSVIEW);
          break;
        default:
          break;
      }
    }
  };

  document.body.addEventListener("keyup", handler);
  return () => document.body.removeEventListener("keyup", handler);
};

const SimpleBottomNavigation: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const handleRedirect = (url: string) => () => history.push(url);

  useEffect(() => hotkeys((url) => history.push(url)), [history]);
  
  const { state } = useContext(AppContext) as AppContextValue;
  const amount = (state.playlist && state.playlist.length) || 0;
  const selected =
    location.pathname.length > 2 ? location.pathname : DISCOVERVIEW;
  return (
    <div>
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          borderTop: "1px solid rgba(0, 0, 0, 0.12)",
        }}
        elevation={4}
      >
        <BottomNavigation
          value={selected}
          showLabels
          sx={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            borderTop: "1px solid rgba(0, 0, 0, 0.12)",
          }}
        >
          <StyledBottomNavigationAction
            label="Favorites"
            value={LIBVIEW}
            onClick={handleRedirect(LIBVIEW)}
            icon={<Favorite />}
          />
          <StyledBottomNavigationAction
            label="Playlist"
            value={PLAYLIST}
            onClick={handleRedirect(PLAYLIST)}
            icon={
              <StyledBadge badgeContent={amount} color="secondary">
                <Playlist />
              </StyledBadge>
            }
          />
          <StyledBottomNavigationAction
            label="Discover"
            value={DISCOVERVIEW}
            onClick={handleRedirect(DISCOVERVIEW)}
            icon={<DiscoverIcon />}
          />
          <StyledBottomNavigationAction
            label="Settings"
            value={SETTINGSVIEW}
            onClick={handleRedirect(SETTINGSVIEW)}
            icon={<Settings />}
          />
        </BottomNavigation>
      </Paper>
      <div style={{ height: 48, width: "100%" }} />
    </div>
  );
};

export default SimpleBottomNavigation;
