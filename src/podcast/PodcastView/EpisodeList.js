import React, { useEffect, useState, useContext } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import DialogContent from "@mui/material/DialogContent";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Chip, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import createDOMPurify from "dompurify";
import { Consumer } from "../../App.js";
import PS from "podcastsuite";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { completeEpisodeHistory as markAsFinished } from "../../reducer";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

import { AppContext } from "../../App";
import { buildThemeFromPalette, toRGBA } from "../../core/podcastPalette";

const DOMPurify = createDOMPurify(window);
const { sanitize } = DOMPurify;
const db = PS.createDatabase("history", "podcasts");
const MIN_ICON_CONTRAST = 4.5;

const parseColor = (value) => {
  if (!value || typeof value !== "string") return null;
  if (value === "transparent") {
    return { rgb: [0, 0, 0], alpha: 0 };
  }
  const hexMatch = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const full = hex.length === 3
      ? hex.split("").map((c) => c + c).join("")
      : hex;
    const int = parseInt(full, 16);
    return {
      rgb: [(int >> 16) & 255, (int >> 8) & 255, int & 255],
      alpha: 1,
    };
  }
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/i);
  if (!match) return null;
  return {
    rgb: [Number(match[1]), Number(match[2]), Number(match[3])],
    alpha: match[4] !== undefined ? Number(match[4]) : 1,
  };
};

const luminance = (color) => {
  const [r, g, b] = color.map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (a, b) => {
  if (!a || !b) return 0;
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [bright, dark] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (bright + 0.05) / (dark + 0.05);
};

const pickHighContrast = (backgroundRGB) => {
  const black = [0, 0, 0];
  const white = [255, 255, 255];
  return contrastRatio(backgroundRGB, black) >= contrastRatio(backgroundRGB, white)
    ? { color: "rgb(0,0,0)", alt: "rgb(255,255,255)" }
    : { color: "rgb(255,255,255)", alt: "rgb(0,0,0)" };
};

const blendColors = (foreground, background) => {
  if (!foreground) return background?.rgb || null;
  if (!background) return foreground.rgb || null;
  const fg = foreground.rgb;
  const bg = background.rgb;
  const alpha = foreground.alpha;
  if (alpha >= 1) return fg;
  const inv = 1 - alpha;
  return [
    Math.round(fg[0] * alpha + bg[0] * inv),
    Math.round(fg[1] * alpha + bg[1] * inv),
    Math.round(fg[2] * alpha + bg[2] * inv),
  ];
};

const resolveIconStyles = (backgroundRGB, preferred, fallback) => {
  const pref = parseColor(preferred)?.rgb;
  const alt = parseColor(fallback)?.rgb;
  if (!backgroundRGB || !pref) return { color: preferred || fallback };
  if (contrastRatio(backgroundRGB, pref) >= MIN_ICON_CONTRAST) {
    return { color: preferred };
  }
  if (alt && contrastRatio(backgroundRGB, alt) >= MIN_ICON_CONTRAST) {
    return { color: fallback };
  }
  const fallbackColors = pickHighContrast(backgroundRGB);
  return {
    color: fallbackColors.color,
    backgroundColor: fallbackColors.alt,
    borderColor: fallbackColors.color,
  };
};

export const clearText = (html) => {
  let tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText;
};

dayjs.extend(relativeTime);
const today = dayjs();
const episodeDate = (date) => today.from(date, true);

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
  const episode = props.episode;
  const { currentTime, duration, completed } = props.history || {};
  const { palette, textColor, subText, accent } = props;
  const total =
    currentTime && duration ? Math.round((currentTime * 100) / duration) : null;
  return (
    <ListItemText
      // {...props}
      primary={
        <>
          {episode.season && (
            <Typography sx={{ color: accent }}>
              Season {episode.season}
            </Typography>
          )}
          <Typography component="div" variant="subtitle1" noWrap sx={{ color: textColor }}>
            {clearText(episode.title)}{" "}
            <IsAvaliable url={episode.enclosures[0].url} />
          </Typography>
          <Typography variant="overline" component="div" sx={{ color: subText }}>
            {(completed || total > 97) && (
              <CheckCircleOutlineIcon sx={{ color: accent }} fontSize="small" />
            )}{" "}
            {episodeDate(episode.created)}
            {total && (
              <Chip
                style={{ marginLeft: "10px" }}
                variant="outlined"
                size="small"
                label={`Progress: ${total}%`}
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
  const [open, setOpen] = React.useState(null);
  const [amount, setAmount] = React.useState(1);
  const [fresh, reFresh] = React.useState(Date.now());
  const { episodes, podcast, playNext, playLast } = props;
  const episodeList = episodes.slice(0, 20 * amount);
  const [drawer, openDrawer] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [message, setMessage] = useState(null);
  // console.log('heree',podcast);
  const { dispatch } = useContext(AppContext);
  const theme = useTheme();
  const palette = props.palette;
  const themeColors = palette ? buildThemeFromPalette(palette) : null;
  const hasPalette = !!themeColors;
  const fallbackText = "rgb(0,0,0)";
  const fallbackSubText = "rgb(30,30,30)";
  const fallbackBackground = "rgb(255,255,255)";
  const textColor = hasPalette ? themeColors?.text : fallbackText;
  const subText = hasPalette ? themeColors?.subText : fallbackSubText;
  const accentBase = hasPalette ? themeColors?.accent : fallbackText;
  const itemBackground = hasPalette ? toRGBA(palette.primary, 0.12) : "transparent";
  const listBackground = hasPalette
    ? themeColors?.secondary || toRGBA(palette.secondary, 0.18)
    : fallbackBackground;
  const baseBackground = hasPalette ? theme.palette.background.default : fallbackBackground;
  const baseColor = parseColor(baseBackground);
  const listColor = parseColor(listBackground);
  const itemColor = parseColor(itemBackground);
  const listEffective = blendColors(listColor, baseColor) || baseColor?.rgb;
  const itemEffective = blendColors(itemColor, { rgb: listEffective, alpha: 1 }) || listEffective;
  const iconStyles = resolveIconStyles(itemEffective, accentBase, textColor);
  const iconButtonSx = {
    color: iconStyles.color,
    backgroundColor: iconStyles.backgroundColor || "transparent",
    border: iconStyles.borderColor ? `1px solid ${iconStyles.borderColor}` : "none",
    "&:hover": {
      backgroundColor: iconStyles.backgroundColor || "transparent",
    },
  };

  useEffect(() => {
    window && window.scrollTo && window.scrollTo(0, 0);
  }, []);

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

  const ShowProgress = ({ guid, episodeData }) => {
    const { currentTime, duration, completed } = episodeData;
    if (completed)
      return (
        <IconButton>
          <CheckCircleIcon style={{ color: "lightgreen" }} />
        </IconButton>
      );

    const total =
      currentTime && duration
        ? Math.round((currentTime * 100) / duration)
        : null;
    if (total) {
      return <div onClick={() => completeEpisode(guid)}>{total}%</div>;
    }
    return (
      <IconButton onClick={() => completeEpisode(guid)}>
        <CheckCircleOutlineIcon />
      </IconButton>
    );
  };

  const closeMessage = () => setMessage(null);

  useEffect(() => {
    // console.log("getting new history");
    getHistory(props.current);
  }, [fresh, props.shouldRefresh]);
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
      <Consumer>
        {(state) => (
          <div style={{ background: listBackground }}>
            {episodeList ? (
              <>
                <List sx={{ background: "transparent" }}>
                  {episodeList.map((episode, id) => {
                    const episodeData = episodeHistory[episode.guid] || {};
                    return (
                      <div key={episode.guid}>
                        <ListItem
                          selected={state.playing === episode.guid}
                          sx={{
                            backgroundColor: itemBackground,
                            color: textColor,
                          }}
                        >
                          <ListItemIcon>
                            <IconButton
                              onClick={props.handler(
                                episode.guid,
                                whenToStart(episodeData),
                                podcast
                              )}
                              sx={iconButtonSx}
                            >
                              {props.playing === episode.guid &&
                              props.status !== "paused" ? (
                                <PauseIcon
                                  fontSize="large"
                                  sx={{ color: iconStyles.color }}
                                />
                              ) : (
                                <PlayArrowIcon
                                  fontSize="large"
                                  sx={{ color: iconStyles.color }}
                                />
                              )}
                            </IconButton>
                          </ListItemIcon>
                          <EpisodeListDescription
                            onClick={() => {

                              setOpen({
                                description: episode.description,
                                title: episode.title,
                              });
                            }}
                            history={episodeData}
                            episode={episode}
                            palette={palette}
                            textColor={textColor}
                            subText={subText}
                            accent={iconStyles.color}
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
                                          label: "Play Next",
                                          icon: "addnext",
                                          fn: () => {
                                            setMessage("Queued to play next");
                                            playNext(episode.guid);
                                          },
                                        },
                                        { label: "Add to queue",
                                        icon: "queue",
                                        fn: () => {
                                          setMessage("Added to queue");
                                          playLast(episode.guid);
                                        } },
                                        { label: "Mark as Played",
                                          fn: () => {
                                            completeEpisode(episode.guid);
                                          }  
                                        },
                                        {
                                          label: "See Description",
                                          icon: "description",
                                          fn: () => setOpen({title: episode.title ,description: episode.description})
                                        }
                                      ],
                                    },
                                    status: true,
                                  },
                                });
                              }}
                              sx={{ color: textColor }}
                            >
                              <MoreVertIcon sx={{ color: textColor }} />
                            </IconButton>

                            {/* <ShowProgress
                              guid={episode.guid}
                              episodeData={episodeData}
                            /> */}
                          </ListItemIcon>
                        </ListItem>
                        <Divider sx={{ borderColor: toRGBA(palette?.primary, 0.2) }} />
                      </div>
                    );
                  })}
                </List>
                {episodes.length > episodeList.length && (
                  <List sx={{ textAlign: "center" }}>
                    <Button
                      onClick={() => setAmount(amount + 1)}
                      variant="outlined"
                      style={{ width: "80%" }}
                      size="large"
                      sx={{
                        borderColor: iconStyles.color,
                        color: textColor,
                      }}
                    >
                      {" "}
                      Load More Episodes{" "}
                    </Button>
                  </List>
                )}
              </>
            ) : (
              <div>
                <CircularProgress />
              </div>
            )}
          </div>
        )}
      </Consumer>
    </>
  );
};
export default EpisodeList;
