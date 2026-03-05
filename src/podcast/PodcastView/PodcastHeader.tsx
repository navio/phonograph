// @ts-nocheck
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
import { FormattedMessage, useIntl } from "react-intl";

import { clearText } from "./EpisodeList";
import { Consumer } from "../../App";
import { useHistory } from "react-router-dom";
import { buildThemeFromPalette, toRGBA } from "../../core/podcastPalette";

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const prod = DEBUG ? '' : ''

function PodcastHeader(props) {
  const { inLibrary, savePodcast, removePodcast, stickyRef } = props;
  const theme = useTheme();
  const intl = useIntl();
  const showDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [descExpanded, setDescExpanded] = React.useState(false);

  React.useEffect(() => {
    // Reset when switching podcasts
    setDescExpanded(false);
  }, [props?.podcast?.domain, props?.podcast?.title]);

  let history = useHistory();
  const isInLibrary = inLibrary()
  const saveThisPodcastToLibrary = (ev) => {
    savePodcast(ev);
    setMessage(intl.formatMessage({ id: "podcast.addedToLibrary", defaultMessage: "Podcast Added to Library" }));
    setOpen(true);
  };

  const removeThisPodcastFromLibrary = () => {
    removePodcast();
    setMessage(intl.formatMessage({ id: "podcast.removedFromLibrary", defaultMessage: "Podcast Removed from Library" }));
    setOpen(true);
  };

  const backHandler = () => history.goBack();

  const handleClose = (_event, _reason) => {
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
        setMessage(intl.formatMessage({ id: "podcast.linkCopied", defaultMessage: "Link copied to clipboard" }));
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
        const enabled = data?.state?.podcastViewEnabled !== false;
        const themeColors = enabled && palette ? buildThemeFromPalette(palette) : null;

        // If we don't have a palette/themeColors (eg CORS/image failure),
        // fall back to the app theme text colors (not white-on-white).
        const textColor = themeColors?.text || theme.palette.text.primary;
        const subText = themeColors?.subText || theme.palette.text.secondary;
        const overlay = enabled
          ? palette
            ? toRGBA(palette.primary, showDesktop ? 0.6 : 0.8)
            : showDesktop
              ? "rgba(0,0,0,0.55)"
              : "rgba(0,0,0,0.75)"
          : "transparent";
        return (
          <>
            <Snackbar
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              autoHideDuration={2000}
              sx={{ pointerEvents: "none", "& .MuiAlert-root": { pointerEvents: "auto" } }}
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
                      aria-label={intl.formatMessage({ id: "a11y.back", defaultMessage: "Go back" })}
                      onClick={backHandler}
                      sx={{ color: theme.palette.primary.contrastText }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    {isInLibrary ? (
                      <Tooltip title={intl.formatMessage({ id: "podcast.removeFromLibrary", defaultMessage: "Remove from library" })} placement="bottom">
                        <IconButton
                          size="small"
                          sx={{ color: theme.palette.primary.contrastText }}
                          onClick={removeThisPodcastFromLibrary}
                          aria-label={intl.formatMessage({ id: "a11y.removeFromLibrary", defaultMessage: "Remove from Library" })}
                        >
                          <Favorite />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={intl.formatMessage({ id: "podcast.addToLibrary", defaultMessage: "Add to Library" })} placement="bottom">
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
                      <Tooltip title={intl.formatMessage({ id: "podcast.sharePodcast", defaultMessage: "Share Podcast" })} placement="bottom">
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
              ref={stickyRef}
              sx={{
                px: { xs: 2, md: 4 },
                pt: { xs: 3, md: 2 },
                pb: { xs: 2, md: 3 },
                position: "sticky",
                top: 48, // dense toolbar height
                zIndex: theme.zIndex.appBar,
                background: enabled && palette
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
              {state.description && (() => {
                const description = clearText(state.description);
                const isLong = description.length > 160;

                return (
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="body1"
                      sx={
                        showDesktop
                          ? { color: subText }
                          : {
                              color: subText,
                              overflow: "hidden",
                              display: descExpanded ? "block" : "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: descExpanded ? "unset" : 2,
                            }
                      }
                    >
                      {description}
                    </Typography>

                    {!showDesktop && isLong && (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setDescExpanded((v) => !v)}
                        aria-expanded={descExpanded}
                        sx={{
                          mt: 0.5,
                          px: 0,
                          minWidth: 0,
                          textTransform: "none",
                          fontWeight: 700,
                          color: enabled
                            ? themeColors?.accentText || textColor
                            : theme.palette.primary.main,
                          backgroundColor: "transparent",
                          "&:hover": {
                            backgroundColor: "transparent",
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {descExpanded
                          ? <FormattedMessage id="common.less" defaultMessage="Less" />
                          : <FormattedMessage id="common.more" defaultMessage="More" />}
                      </Button>
                    )}
                  </Box>
                );
              })()}
              <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
                {!isInLibrary ? (
                  <Button
                    onClick={saveThisPodcastToLibrary}
                    variant="contained"
                    sx={{
                      backgroundColor: enabled
                        ? themeColors?.accent || theme.palette.primary.main
                        : theme.palette.primary.main,
                      color: enabled
                        ? themeColors?.accentText || theme.palette.primary.contrastText
                        : theme.palette.primary.contrastText,
                    }}
                  >
                    <FormattedMessage id="podcast.subscribe" defaultMessage="Subscribe" />
                  </Button>
                ) : (
                  <Button
                    onClick={removeThisPodcastFromLibrary}
                    variant="outlined"
                    sx={{
                      borderColor: enabled
                        ? themeColors?.accent || theme.palette.primary.main
                        : theme.palette.primary.main,
                      color: enabled
                        ? themeColors?.accentText || textColor
                        : theme.palette.primary.main,
                    }}
                  >
                    <FormattedMessage id="podcast.unsubscribe" defaultMessage="Unsubscribe" />
                  </Button>
                )}
                <Typography sx={{ color: subText }}>
                  <b><FormattedMessage id="podcast.episodes" defaultMessage="Episodes:" /></b> {state.items.length}
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
