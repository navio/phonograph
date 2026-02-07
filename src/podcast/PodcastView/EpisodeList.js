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
  const textColor = themeColors?.text || theme.palette.text.primary;
  const subText = themeColors?.subText || theme.palette.text.secondary;
  const accent = themeColors?.accent || theme.palette.secondary.main;
  const listBackground = palette
    ? themeColors?.secondary || toRGBA(palette.secondary, 0.18)
    : theme.palette.background.default;

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
                            backgroundColor: palette ? toRGBA(palette.primary, 0.12) : "transparent",
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
                              sx={{ color: accent }}
                            >
                              {props.playing === episode.guid &&
                              props.status !== "paused" ? (
                                <PauseIcon
                                  fontSize="large"
                                  sx={{ color: accent }}
                                />
                              ) : (
                                <PlayArrowIcon
                                  fontSize="large"
                                  sx={{ color: accent }}
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
                        borderColor: accent,
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
