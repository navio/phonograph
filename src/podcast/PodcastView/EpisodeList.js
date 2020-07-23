import React, { useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import DialogContent from "@material-ui/core/DialogContent";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Chip, IconButton } from "@material-ui/core";
import createDOMPurify from "dompurify";
import { Consumer } from "../../App.js";
import PS from "podcastsuite";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { completeEpisodeHistory as markAsFinished } from "../../reducer";
import MoreVertIcon from "@material-ui/icons/MoreVert";

import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";

import MuiAlert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";

import { AppContext } from "../../App";

const DOMPurify = createDOMPurify(window);
const { sanitize } = DOMPurify;
const db = PS.createDatabase("history", "podcasts");

export const clearText = (html) => {
  let tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText;
};

export const styles = (theme) => ({
  inProgress: {
    color: theme.palette.primary.main,
  },
});

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
  const classes = props.classes;
  const { currentTime, duration, completed } = props.history || {};
  const total =
    currentTime && duration ? Math.round((currentTime * 100) / duration) : null;
  return (
    <ListItemText
      // {...props}
      primary={
        <>
          {episode.season && (
            <Typography color={"secondary"}>Season {episode.season}</Typography>
          )}
          <Typography component="div" variant="subtitle1" noWrap>
            {clearText(episode.title)}{" "}
            <IsAvaliable url={episode.enclosures[0].url} />
          </Typography>
          <Typography variant="overline" component="div">
            {(completed || total > 97) && (
              <CheckCircleOutlineIcon color="primary" fontSize="small" />
            )}{" "}
            {episodeDate(episode.created)}
            {total && (
              <Chip
                style={{ marginLeft: "10px" }}
                variant="outlined"
                size="small"
                label={`Progress: ${total}%`}
                className={classes.inProgress}
              />
            )}
            {episode.episodeType && episode.episodeType !== "full" && (
              <Chip
                style={{ marginLeft: "10px" }}
                variant="outlined"
                size="small"
                label={episode.episodeType}
                color="secondary"
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
  const { classes, episodes, podcast, playNext, playLast } = props;
  const episodeList = episodes.slice(0, 20 * amount);
  const [drawer, openDrawer] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [message, setMessage] = useState(null);
  // console.log('heree',podcast);
  const { dispatch } = useContext(AppContext);

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

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

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
        <Alert severity="success">{message}</Alert>
      </Snackbar>
      <Description handleClose={handleClose} open={open} />
      <Consumer>
        {(state) => (
          <div className={classes.root}>
            {episodeList ? (
              <>
                <List>
                  {episodeList.map((episode, id) => {
                    const episodeData = episodeHistory[episode.guid] || {};
                    return (
                      <div key={episode.guid}>
                        <ListItem
                          className={
                            state.playing === episode.guid
                              ? classes.selected
                              : null
                          }
                        >
                          <ListItemIcon>
                            <IconButton
                              onClick={props.handler(
                                episode.guid,
                                whenToStart(episodeData),
                                podcast
                              )}
                            >
                              {props.playing === episode.guid &&
                              props.status !== "paused" ? (
                                <PauseIcon
                                  fontSize="large"
                                  className={classes.playIcon}
                                />
                              ) : (
                                <PlayArrowIcon
                                  fontSize="large"
                                  className={classes.playIcon}
                                />
                              )}
                            </IconButton>
                          </ListItemIcon>
                          <EpisodeListDescription
                            classes={classes}
                            onClick={() => {

                              setOpen({
                                description: episode.description,
                                title: episode.title,
                              });
                            }}
                            history={episodeData}
                            episode={episode}
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
                            >
                              <MoreVertIcon />
                            </IconButton>

                            {/* <ShowProgress
                              guid={episode.guid}
                              episodeData={episodeData}
                            /> */}
                          </ListItemIcon>
                        </ListItem>
                        <Divider />
                      </div>
                    );
                  })}
                </List>
                {episodes.length > episodeList.length && (
                  <List align="center">
                    <Button
                      onClick={() => setAmount(amount + 1)}
                      variant="outlined"
                      style={{ width: "80%" }}
                      size="large"
                      color="primary"
                    >
                      {" "}
                      Load More Episodes{" "}
                    </Button>
                  </List>
                )}
              </>
            ) : (
              <div className={classes.progressContainer}>
                <CircularProgress className={classes.progress} />
              </div>
            )}
          </div>
        )}
      </Consumer>
    </>
  );
};

EpisodeList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EpisodeList);
