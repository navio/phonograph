import React from "react";
import {
  AppBar,
  Box,
  Button,
  Grid,
  IconButton,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Favorite from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ShareIcon from "@mui/icons-material/ShareOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Alert from "@mui/material/Alert";

import { clearText } from "./EpisodeList";
import { Consumer } from "../../App.js";
import { useHistory } from "react-router-dom";
import { buildThemeFromPalette, toRGBA } from "../../core/podcastPalette";

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const prod = DEBUG ? '' : ''

function PodcastHeader(props) {
  const { inLibrary, savePodcast, removePodcast } = props;
  const theme = useTheme();
  const showDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  let history = useHistory();
  const isInLibrary = inLibrary()
  const saveThisPodcastToLibrary = (ev) => {
    savePodcast(ev);
    setMessage("Podcast Added to Library");
    setOpen(true);
  };

  const backHandler = () => history.goBack();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  // const colorThief = new ColorThief();

  const makeMeAHash = (url) => btoa(url);


  const shareLink = !!(navigator.share || navigator.clipboard);
  const share = (title, text, url) => {
    if (navigator.share) {
      return () =>
        navigator.share({
          title,
          text,
          url,
        });
    } else if (navigator.clipboard) {
      return () => {
        navigator.clipboard.writeText(`${title} ${url.toString()}`);
        setMessage("Link copied to clipboard");
        setOpen(true);
      };
    } else {
      return false;
    }
  };

  return (
    <Consumer>
      {(data) => {
        const state = props.podcast;
        const { palette } = props;
        const themeColors = palette ? buildThemeFromPalette(palette) : null;
        const textColor = themeColors?.text || theme.palette.common.white;
        const subText = themeColors?.subText || theme.palette.common.white;
        const overlay = palette
          ? toRGBA(palette.primary, showDesktop ? 0.6 : 0.8)
          : showDesktop
            ? "rgba(0,0,0,0.55)"
            : "rgba(0,0,0,0.75)";
        return (
          <>
            <Snackbar
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              autoHideDuration={4000}
            >
              <Alert elevation={6} variant="filled" severity="success">
                {message}
              </Alert>
            </Snackbar>
            <AppBar
              position="sticky"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                zIndex: theme.zIndex.appBar + 1,
              }}
            >
              <Toolbar variant="dense">
                <Grid container alignItems="center">
                  <Grid item xs={6}>
                    <IconButton
                      size="small"
                      aria-label="back"
                      onClick={backHandler}
                      sx={{ color: theme.palette.primary.contrastText }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    {isInLibrary ? (
                      <Tooltip title="Remove from library" placement="bottom">
                        <IconButton
                          size="small"
                          sx={{ color: theme.palette.primary.contrastText }}
                          onClick={removePodcast}
                          aria-label="Remove from Library"
                        >
                          <Favorite />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Add to Library" placement="bottom">
                        <IconButton
                          size="small"
                          sx={{ color: theme.palette.primary.contrastText }}
                          onClick={saveThisPodcastToLibrary}
                        >
                          <BookmarkBorderIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {shareLink && (
                      <Tooltip title="Share Podcast" placement="bottom">
                        <IconButton
                          sx={{ color: theme.palette.primary.contrastText }}
                          size="small"
                          onClick={share(
                            "Phonograph",
                            state.title,
                            `${document.location.origin}/podcast/${makeMeAHash(state.domain)}`
                          )}
                        >
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Grid>
                </Grid>
              </Toolbar>
            </AppBar>
            <Box
              sx={{
                minHeight: {
                  xs: "20vh",
                  sm: "20vh",
                  md: "15vh",
                },
                position: "relative",
                backgroundImage: state.image ? `url(${prod + state.image})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: overlay,
                }}
              />
              <Box sx={{ position: "relative", zIndex: 1, height: "100%" }}>
                {!showDesktop && null}
              </Box>
            </Box>
            <Box
              sx={{
                px: { xs: 2, md: 4 },
                pt: { xs: 3, md: 2 },
                pb: { xs: 2, md: 3 },
                background: palette
                  ? themeColors?.primary
                  : theme.palette.background.default,
              }}
            >
              <Typography
                variant={showDesktop ? "h3" : "h4"}
                sx={{ color: textColor, fontWeight: 700 }}
              >
                {state.title}
              </Typography>
              {state.author && (
                <Typography variant="subtitle1" sx={{ color: subText, mt: 0.5 }}>
                  {state.author}
                </Typography>
              )}
              {state.description && (
                <Typography
                  variant="body1"
                  sx={{ color: subText, mt: 1, maxWidth: "65ch" }}
                >
                  {clearText(state.description)}
                </Typography>
              )}
              <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
                {!isInLibrary && (
                  <Button
                    onClick={saveThisPodcastToLibrary}
                    variant="contained"
                    sx={{
                      backgroundColor: themeColors?.accent || theme.palette.primary.main,
                      color: themeColors?.accentText || textColor,
                    }}
                  >
                    Subscribe
                  </Button>
                )}
                <Typography sx={{ color: subText }}>
                  <b>Episodes:</b> {state.items.length}
                </Typography>
              </Box>
            </Box>
          </>
        );
      }}
    </Consumer>
  );
}

export default PodcastHeader;
