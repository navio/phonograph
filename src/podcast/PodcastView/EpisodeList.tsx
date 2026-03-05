// @ts-nocheck
import React, { useEffect, useState, useContext, useMemo } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import DialogContent from "@mui/material/DialogContent";
import { Chip, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import createDOMPurify from "dompurify";
import { FormattedMessage, useIntl } from "react-intl";
import PS from "podcastsuite";
import { completeEpisodeHistory as markAsFinished } from "../../reducer";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

import { AppContext } from "../../App";
import { buildThemeFromPalette, toRGBA } from "../../core/podcastPalette";

import { useVirtualizer } from "@itsmeadarsh/warper";

const DOMPurify = createDOMPurify(window);
const { sanitize } = DOMPurify;
const db = PS.createDatabase("history", "podcasts");

export const clearText = (html) => {
  let tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText;
};

const saveOffline = async (mediaURL) => {
  // const audio = document.createElement('audio');
  // audio.src = mediaURL;
  // window.audio = audio;
  // console.log(audio.data);

  // const rawPodcast = await fetch('/rss-full/'+(mediaURL));
  // const podcastBlob = await rawPodcast.blob();
  // const response = new Response(podcastBlob)

  const cache = await caches.open("offline-podcasts");
  await cache.put(mediaURL, response);
  cache.add(mediaURL);
};

const IsAvaliable = (url) => {
  const [hasIt, setHasIt] = useState(false);

  const availableOffline = async (media) => {
    const has = await caches.has(media);
    setHasIt(has);
  };

  useEffect(() => {
    availableOffline(url.url);
  }, []);

  return hasIt ? "Saved" : "";
};

const EpisodeListDescription = (props) => {
  const intl = useIntl();
  const episode = props.episode;
  const { currentTime, duration, completed } = props.history || {};
  const { palette, textColor, subText, accent } = props;
  const total =
    currentTime && duration ? Math.round((currentTime * 100) / duration) : null;

  // Format relative time using intl
  const episodeAge = episode.created
    ? intl.formatRelativeTime(
        -Math.round((Date.now() - new Date(episode.created).getTime()) / (24 * 60 * 60 * 1000)),
        "day",
        { numeric: "auto" }
      ).replace(/^in /, "").replace(/ ago$/, "")
    : "";

  return (
    <ListItemText
      // {...props}
      primary={
        <>
          {episode.season && (
            <Typography sx={{ color: accent }}>
              <FormattedMessage id="episode.season" defaultMessage="Season {season}" values={{ season: episode.season }} />
            </Typography>
          )}
          <Typography component="div" variant="subtitle1" noWrap sx={{ color: textColor }}>
            {clearText(episode.title)}{" "}
            <IsAvaliable url={episode.enclosures[0].url} />
          </Typography>
          <Typography variant="overline" component="div" sx={{ color: subText }}>
            {(completed || total > 97) && (
              <CheckCircleOutlineIcon sx={{ color: textColor }} fontSize="small" />
            )}{" "}
            {episodeAge}
            {total && (
              <Chip
                style={{ marginLeft: "10px" }}
                variant="outlined"
                size="small"
                label={intl.formatMessage({ id: "episode.progress", defaultMessage: "Progress: {percent}%" }, { percent: total })}
                sx={{
                  borderColor: accent,
                  color: textColor,
                }}
              />
            )}
            {episode.episodeType && episode.episodeType !== "full" && (
              <Chip
                style={{ marginLeft: "10px" }}
                variant="outlined"
                size="small"
                label={episode.episodeType}
                sx={{
                  borderColor: accent,
                  color: textColor,
                }}
              />
            )}
          </Typography>
        </>
      }
    />
  );
};

const Description = (props) => {
  const { title, description } = props.open || {};
  return (
    props.open && (
      <Dialog
        onClose={props.handleClose}
        aria-labelledby="simple-dialog-title"
        open={!!props.open}
      >
        <DialogTitle id="simple-dialog-title">
          <span dangerouslySetInnerHTML={{ __html: sanitize(title) }} />
        </DialogTitle>
        <DialogContent style={{ paddingBottom: "1rem" }}>
          <div dangerouslySetInnerHTML={{ __html: sanitize(description) }} />
        </DialogContent>
      </Dialog>
    )
  );
};

const EpisodeList = (props) => {
  const [episodeHistory, setEpisodeHistory] = useState({});
  const [open, setOpen] = useState(null);
  const [fresh, reFresh] = useState(Date.now());
  const { episodes = [], podcast, playNext, playLast } = props;
  const [message, setMessage] = useState(null);
  const { dispatch } = useContext(AppContext);
  const intl = useIntl();
  const theme = useTheme();
  const palette = props.palette;
  const themeColors = palette ? buildThemeFromPalette(palette) : null;

  const INITIAL_LOAD = 60;
  const PAGE_SIZE = 40;
  const LOAD_MORE_DISTANCE_PX = 800;
  const BOTTOM_INSET_PX = 96;
  const ESTIMATED_ROW_HEIGHT = 88;

  const [visibleCount, setVisibleCount] = useState(Math.min(episodes.length, INITIAL_LOAD));

  useEffect(() => {
    setVisibleCount(Math.min(episodes.length, INITIAL_LOAD));
  }, [props.current, episodes.length]);

  const itemCount = Math.min(visibleCount, episodes.length);
  const hasMore = itemCount < episodes.length;

  const {
    scrollElementRef,
    range,
    totalHeight,
    isLoading: warperLoading,
    error: warperError,
  } = useVirtualizer({
    itemCount,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 8,
  });

  const [scrollEl, setScrollEl] = useState(null);
  const attachScrollEl = React.useCallback(
    (node) => {
      scrollElementRef.current = node;
      setScrollEl(node);
    },
    [scrollElementRef]
  );

  const [containerHeight, setContainerHeight] = useState(600);

  // The episode list sits on a secondary surface; use tokens derived for that surface.
  const listBackground = palette
    ? themeColors?.secondary || toRGBA(palette.secondary, 0.18)
    : theme.palette.background.default;

  const textColor = palette
    ? themeColors?.secondaryText || themeColors?.text || theme.palette.text.primary
    : theme.palette.text.primary;
  const subText = palette
    ? themeColors?.secondarySubText || themeColors?.subText || theme.palette.text.secondary
    : theme.palette.text.secondary;
  const accent = palette
    ? themeColors?.secondaryAccent || themeColors?.accent || theme.palette.secondary.main
    : theme.palette.secondary.main;

  // For icon buttons on the list rows, prioritize legibility.
  const iconColor = textColor;

  useEffect(() => {
    window && window.scrollTo && window.scrollTo(0, 0);
  }, [props.current]);

  useEffect(() => {
    const update = () => {
      const el = scrollEl;
      if (!el || typeof window === "undefined") return;
      const rect = el.getBoundingClientRect();
      const next = Math.max(320, Math.floor(window.innerHeight - rect.top - BOTTOM_INSET_PX));
      setContainerHeight(next);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [scrollEl]);

  useEffect(() => {
    const el = scrollEl;
    if (!el) return;

    const onScroll = () => {
      if (!hasMore) return;
      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distanceToBottom < LOAD_MORE_DISTANCE_PX) {
        setVisibleCount((count) => Math.min(episodes.length, count + PAGE_SIZE));
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [episodes.length, hasMore, scrollEl]);

  const handleClose = (value) => {
    setOpen(null);
    // reFresh(Date.now());
    // setSelectedValue(value);
  };

  const completeEpisode = async (episode) => {
    const refreshCB = () => reFresh(Date.now());
    await markAsFinished(props.current, episode, refreshCB);
  };

  const whenToStart = (history = {}) => {
    return history.currentTime || 0;
  };

  const getHistory = async (feed) => {
    const history = await db.get(feed);
    setEpisodeHistory(history || {});
  };

  const closeMessage = () => setMessage(null);

  useEffect(() => {
    // console.log("getting new history");
    getHistory(props.current);
  }, [fresh, props.shouldRefresh, props.current]);

  const virtualItems = useMemo(() => {
    if (!range?.items?.length) return [];
    return range.items.map((index, i) => ({
      index,
      offset: range.offsets[i],
      size: range.sizes[i],
    }));
  }, [range]);

  return (
    <>
      <Snackbar
        open={message}
        onClose={closeMessage}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={4000}
      >
        <Alert elevation={6} variant="filled" severity="success">
          {message}
        </Alert>
      </Snackbar>
      <Description handleClose={handleClose} open={open} />
      <div style={{ background: listBackground }}>
        {!episodes.length ? (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <CircularProgress />
          </div>
        ) : (
          <div
            ref={attachScrollEl}
            style={{
              height: containerHeight,
              overflowY: "auto",
              overflowX: "hidden",
              paddingBottom: `${BOTTOM_INSET_PX}px`,
              WebkitOverflowScrolling: "touch",
            }}
          >
            {warperError && (
              <div style={{ padding: "12px 16px" }}>
                <Alert severity="warning">
                  {intl.formatMessage({
                    id: "episode.virtualizerError",
                    defaultMessage: "Virtualization failed to initialize; performance may be degraded.",
                  })}
                </Alert>
              </div>
            )}

            <div style={{ height: totalHeight, position: "relative" }}>
              <List component="div" sx={{ background: "transparent", m: 0, p: 0 }}>
                {virtualItems.map(({ index, offset, size }) => {
                  const episode = episodes[index];
                  if (!episode) return null;
                  const episodeData = episodeHistory[episode.guid] || {};

                  return (
                    <div
                      key={episode.guid}
                      style={{
                        position: "absolute",
                        top: 0,
                        transform: `translateY(${offset}px)`,
                        height: size,
                        width: "100%",
                      }}
                    >
                      <ListItem
                        component="div"
                        selected={props.playing === episode.guid}
                        sx={{
                          backgroundColor: palette ? toRGBA(palette.primary, 0.12) : "transparent",
                          color: textColor,
                        }}
                      >
                        <ListItemIcon>
                          <IconButton
                            onClick={props.handler(episode.guid, whenToStart(episodeData), podcast)}
                            sx={{
                              color: iconColor,
                              backgroundColor: palette ? toRGBA(palette.primary, 0.18) : "transparent",
                              "&:hover": {
                                backgroundColor: palette ? toRGBA(palette.primary, 0.26) : undefined,
                              },
                            }}
                          >
                            {props.playing === episode.guid && props.status !== "paused" ? (
                              <PauseIcon fontSize="large" sx={{ color: iconColor }} />
                            ) : (
                              <PlayArrowIcon fontSize="large" sx={{ color: iconColor }} />
                            )}
                          </IconButton>
                        </ListItemIcon>

                        <EpisodeListDescription
                          onClick={() => {
                            setOpen({ description: episode.description, title: episode.title });
                          }}
                          history={episodeData}
                          episode={episode}
                          palette={palette}
                          textColor={textColor}
                          subText={subText}
                          accent={accent}
                        />

                        <ListItemIcon>
                          <IconButton
                            edge="end"
                            onClick={() => {
                              dispatch({
                                type: "drawer",
                                payload: {
                                  drawerContent: {
                                    typeContent: "list",
                                    content: [
                                      {
                                        label: intl.formatMessage({
                                          id: "episode.playNext",
                                          defaultMessage: "Play Next",
                                        }),
                                        icon: "addnext",
                                        fn: () => {
                                          setMessage(
                                            intl.formatMessage({
                                              id: "episode.queuedNext",
                                              defaultMessage: "Queued to play next",
                                            })
                                          );
                                          playNext(episode.guid);
                                        },
                                      },
                                      {
                                        label: intl.formatMessage({
                                          id: "episode.addToQueue",
                                          defaultMessage: "Add to queue",
                                        }),
                                        icon: "queue",
                                        fn: () => {
                                          setMessage(
                                            intl.formatMessage({
                                              id: "episode.addedToQueue",
                                              defaultMessage: "Added to queue",
                                            })
                                          );
                                          playLast(episode.guid);
                                        },
                                      },
                                      {
                                        label: intl.formatMessage({
                                          id: "episode.markAsPlayed",
                                          defaultMessage: "Mark as Played",
                                        }),
                                        fn: () => {
                                          completeEpisode(episode.guid);
                                        },
                                      },
                                      {
                                        label: intl.formatMessage({
                                          id: "episode.seeDescription",
                                          defaultMessage: "See Description",
                                        }),
                                        icon: "description",
                                        fn: () =>
                                          setOpen({ title: episode.title, description: episode.description }),
                                      },
                                    ],
                                  },
                                  status: true,
                                },
                              });
                            }}
                            sx={{
                              color: iconColor,
                              backgroundColor: palette ? toRGBA(palette.primary, 0.08) : "transparent",
                              "&:hover": {
                                backgroundColor: palette ? toRGBA(palette.primary, 0.16) : undefined,
                              },
                            }}
                          >
                            <MoreVertIcon sx={{ color: iconColor }} />
                          </IconButton>
                        </ListItemIcon>
                      </ListItem>
                      <Divider sx={{ borderColor: toRGBA(palette?.primary, 0.2) }} />
                    </div>
                  );
                })}
              </List>
            </div>

            {(warperLoading || hasMore) && (
              <div style={{ padding: "12px 16px", textAlign: "center" }}>
                <Typography variant="caption" sx={{ color: subText }}>
                  {warperLoading
                    ? intl.formatMessage({ id: "episode.loadingVirtualizer", defaultMessage: "Loading list..." })
                    : intl.formatMessage({ id: "episode.scrollForMore", defaultMessage: "Scroll for more episodes" })}
                </Typography>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
export default EpisodeList;
