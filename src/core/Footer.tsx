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
import { useIntl } from "react-intl";
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
  const intl = useIntl();
  const bottomNavHeight = 56;
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
          left: 0,
          right: 0,
          width: "100%",
          borderTop: "1px solid rgba(0, 0, 0, 0.12)",
          paddingBottom: "env(safe-area-inset-bottom)",
          zIndex: (theme) => theme.zIndex.appBar,
        }}
        elevation={4}
      >
        <BottomNavigation
          value={selected}
          showLabels
          sx={{
            width: "100%",
            height: `${bottomNavHeight}px`,
          }}
        >
          <StyledBottomNavigationAction
            label={intl.formatMessage({ id: "nav.favorites", defaultMessage: "Favorites" })}
            value={LIBVIEW}
            onClick={handleRedirect(LIBVIEW)}
            icon={<Favorite />}
          />
          <StyledBottomNavigationAction
            label={intl.formatMessage({ id: "nav.playlist", defaultMessage: "Playlist" })}
            value={PLAYLIST}
            onClick={handleRedirect(PLAYLIST)}
            icon={
              <StyledBadge badgeContent={amount} color="secondary">
                <Playlist />
              </StyledBadge>
            }
          />
          <StyledBottomNavigationAction
            label={intl.formatMessage({ id: "nav.discover", defaultMessage: "Discover" })}
            value={DISCOVERVIEW}
            onClick={handleRedirect(DISCOVERVIEW)}
            icon={<DiscoverIcon />}
          />
          <StyledBottomNavigationAction
            label={intl.formatMessage({ id: "nav.settings", defaultMessage: "Settings" })}
            value={SETTINGSVIEW}
            onClick={handleRedirect(SETTINGSVIEW)}
            icon={<Settings />}
          />
        </BottomNavigation>
      </Paper>
      <div style={{ height: `calc(${bottomNavHeight}px + env(safe-area-inset-bottom))`, width: "100%" }} />
    </div>
  );
};

export default SimpleBottomNavigation;
