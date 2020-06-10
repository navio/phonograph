import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Slider, Box } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import SkipPreviousIcon from "@material-ui/icons/Replay10";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/Forward30";
import LinearProgress from "@material-ui/core/LinearProgress";
import { Grid, Card, Hidden, Paper } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { AppContext } from "../App.js";

import SpeedControl from "./SpeedControl";
import SleepTimer from "./SleepTimer";
// import SpeedIcon from '@material-ui/icons/Speed';
// import ToggleButton from '@material-ui/lab/ToggleButton';
// import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import { PODCASTVIEW } from "../constants";

const styles = (theme) => ({
  card: {},
  details: {
    flexDirection: "column",
  },
  content: {
    flex: "1 0 auto",
  },
  cover: {
    width: 151,
    height: 151,
    margin: "30px",
  },
  controls: {
    //paddingTop: '2rem'
    paddingTop: theme.spacing(2),
  },
  left: {
    padding: 0,
  },
  right: {
    padding: 0,
  },
  line: {
    position: "absolute",
    top: "8px",
    width: "100%",
  },
  progress: {
    position: "absolute",
    top: "7px",
    width: "100%",
  },
  trackAfter: {
    display: "none",
  },
  center: {
    textAlign: "center",
    padding: 0,
  },
  playClosed: {
    width: "3rem",
    maxHeight: "3rem",
    minHeight: "2rem",
  },
  playIcon: {
    height: 70,
    width: 70,
  },
  controlIcon: {
    top: "100%",
    position: "absolute",
    height: 40,
    width: 40,
    // color: theme.palette.secondary.main
  },
  player: {
    // paddingLeft: 20,
    // paddingRight: 20,
  },
  undeground: {
    display: "block",
    height: "3.5rem",
    width: "100%",
  },
  classNameProp: {
    position: "absolute",
  },
  container: {
    position: "relative",
    top: "-.5rem",
  },

  podcastImage: {
    width: "100%",
    display: "block",
    margin: "0 auto",
    paddingBottom: "5vh",
  },
  podcastImageClosed: {
    display: "block",
    maxWidth: "5rem",
    width: "3rem",
  },
  title: {
    padding: "10px 5px",
    color: theme.palette.text.primary,
  },
  subtitle: {
    margin: "0 2em 1rem",
    height: "3.5rem",
    display: "block",
    overflow: "hidden",
  },
  rootClosed: {
    bottom: "3.50rem",
    width: "100%",
    borderTop: `1px solid ${theme.palette.secondary.main}`,
    backgroundColor: theme.palette.background.paper,
    position: "fixed",
    zIndex: 2,
  },
  root: {
    borderTop: `1px solid ${theme.palette.secondary.main}`,
    position: "fixed",
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    zIndex: 50,
    height: "100%",
    top: "0px",
    zIndex: 2,
  },
});

const toMinutes = (totalTime, currentTime) => {
  totalTime = Math.floor(totalTime - currentTime);
  if (!Number.isInteger(totalTime)) return "∞";
  return "- " + convertMinsToHrsMins(totalTime);
};

const toMin = (theTime) =>
  typeof theTime === "number"
    ? convertMinsToHrsMins(Math.floor(theTime))
    : `00:00`;

const convertMinsToHrsMins = (mins) => {
  if (!Number.isInteger(mins)) return "";
  let h = Math.floor(mins / 60);
  let m = mins % 60;
  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  return `${h}:${m}`;
};

const MediaControlCard = (props) => {
  const { state, dispatch } = useContext(AppContext);
  const [open, setOpen] = useState(null);
  const { classes, theme } = props;
  const history = useHistory();

  const [showSpeed, setShowSpeed] = useState(true);
  const [showTimer, setShowTimer] = useState(true);

  const saveStorage = (value) => {
    console.log(value);
    localStorage.setItem('openPlayer', value);
  }

  const hotkeys = (setOpen) => {
    document.body.addEventListener("keydown", (ev) => {
      const { target, key } = ev;
      if (document.body == target) {
        if('Escape' === key) {
          setOpen(value => {  saveStorage(!value); return !value } );
        }
      }
    });
  };

  const toOrigin = (audioOrigin) => () => {
    dispatch({ type: "updateCurrent", payload: audioOrigin });
    history.push(PODCASTVIEW);
  };

  const { episodeInfo = {}, media, playing } = state;

  useEffect(() => {
    const overflow = "overflow: hidden;";
    if (open && playing) {
      // console.log('locking scrolling')
      document.body.style = overflow;
    } else {
      document.body.style = "";
    }
  }, [open]);

  useEffect(() => setOpen(true), [media]);

  useEffect(() => {
    hotkeys(setOpen);
    if(localStorage){
      const status = localStorage.getItem('openPlayer') || true;
      console.log('value', status, setOpen );
      setOpen(false);
    }
  }, []);

  return state.episodeInfo ? (
    <>
      <Card
        variant="outlined"
        className={open ? classes.root : classes.rootClosed}
      >
        {open && (
          <Grid container direction="row-reverse">
            <Grid item style={{ padding: ".5rem" }}>
              <IconButton onClick={() => { saveStorage(!open); setOpen(false); }}>
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        )}
        {state.episodeInfo && (
          <div className={classes.card}>
            {open && (
              <Grid
                container
                container
                direction="row"
                justify="center"
                alignItems="center"
              >
                <Grid item xs={7} sm={6} md={4} lg={3}>
                  <img
                    className={classes.podcastImage}
                    src={state.podcastImage}
                  />
                </Grid>
              </Grid>
            )}
            <div className={classes.details}>
              {open && (
                <Typography
                  onClick={toOrigin(state.audioOrigin)}
                  align={"center"}
                  className={classes.title}
                  variant="h6"
                  noWrap
                >
                  {episodeInfo.title}
                </Typography>
              )}

              {open && state.podcastAuthor && (
                <Typography variant="body2" align="center" gutterBottom>
                  {state.podcastAuthor}
                </Typography>
              )}

              {open && episodeInfo.subtitle && (
                <Typography
                  variant="subtitle1"
                  align="center"
                  className={classes.subtitle}
                  gutterBottom
                >
                  {episodeInfo.subtitle}
                </Typography>
              )}

              <Grid
                container
                direction="row"
                justify={open ? "space-around" : "space-between"}
                alignItems="center"
                className={classes.player}
              >
                {!open && (
                  <>
                    {
                      <Grid
                        item
                        align="left"
                        style={{ paddingLeft: ".14rem" }}
                        xs={1}
                      >
                        <img
                          onClick={() => setOpen(true)}
                          className={classes.podcastImageClosed}
                          src={state.podcastImage}
                        />
                      </Grid>
                    }
                    <Grid item align="center" xs={1}>
                      <IconButton
                        aria-label="Play/pause"
                        onClick={() => props.handler()}
                        data-guid={state.playing}
                      >
                        {state.playing === (episodeInfo && episodeInfo.guid) &&
                        state.status !== "pause" ? (
                          <PauseIcon className={classes.playClosed} />
                        ) : (
                          <PlayArrowIcon className={classes.playClosed} />
                        )}
                      </IconButton>
                    </Grid>
                  </>
                )}
                <Grid align="center" item xs={2} md={1}>
                  <span>{toMin(state.currentTime)}</span>
                </Grid>
                <Grid className={classes.container} item xs={5} md={6}>
                  <LinearProgress
                    className={classes.progress}
                    variant="buffer"
                    value={state.played}
                    valueBuffer={state.loaded}
                  />
                  <Slider
                    style={{ padding: "0px" }}
                    className={classes.line}
                    value={state.played}
                    aria-labelledby="audio"
                    onChange={props.seek}
                  />
                </Grid>
                <Grid align="center" item xs={2} md={1}>
                  <span>{toMinutes(state.duration, state.currentTime)}</span>
                </Grid>
                {!open && (
                  <Hidden only={"xs"}>
                    <Grid
                      align="right"
                      item
                      xs={1}
                      style={{ paddingRight: ".14rem" }}
                    >
                      <IconButton onClick={() => setOpen(true)}>
                        <ExpandLessIcon />
                      </IconButton>
                    </Grid>
                  </Hidden>
                )}
              </Grid>

              {open && (
                <>
                  <Grid container className={classes.controls}>
                    <Grid
                      item
                      xs={3}
                      sm={4}
                      align={open ? "right" : "center"}
                      className={classes.right}
                    >
                      <IconButton
                        style={{ padding: "0" }}
                        aria-label="Previous"
                        onClick={props.rewind}
                      >
                        {theme.direction === "rtl" ? (
                          <SkipNextIcon className={classes.controlIcon} />
                        ) : (
                          <SkipPreviousIcon className={classes.controlIcon} />
                        )}
                      </IconButton>
                    </Grid>
                    <Grid item xs={6} sm={4} className={classes.center}>
                      <IconButton
                        style={{ padding: "0" }}
                        aria-label="Play/pause"
                        onClick={() => props.handler()}
                        data-guid={state.playing}
                      >
                        {state.playing === (episodeInfo && episodeInfo.guid) &&
                        state.status !== "pause" ? (
                          <PauseIcon className={classes.playIcon} />
                        ) : (
                          <PlayArrowIcon className={classes.playIcon} />
                        )}
                      </IconButton>
                    </Grid>
                    <Grid
                      item
                      xs={3}
                      sm={4}
                      align={open ? "left" : "center"}
                      className={classes.left}
                    >
                      <IconButton
                        style={{ padding: "0" }}
                        aria-label="Next"
                        onClick={props.forward}
                      >
                        {theme.direction === "rtl" ? (
                          <SkipPreviousIcon className={classes.controlIcon} />
                        ) : (
                          <SkipNextIcon className={classes.controlIcon} />
                        )}
                      </IconButton>
                    </Grid>
                  </Grid>
                  <Box m={2}>
                    <Grid
                      container
                      direction="row"
                      justify="space-evenly"
                      alignItems="center"
                    >
                      {showSpeed && (
                        <Grid item align="center">
                          <SpeedControl onClick={setShowTimer} />
                        </Grid>
                      )}
                      {showTimer && (
                        <Grid item align="center">
                          <SleepTimer onClick={setShowSpeed} />
                        </Grid>
                      )}
                      {/* <Grid item>
                        <IconButton><MoreVertIcon /></IconButton>
                      </Grid> */}
                    </Grid>
                  </Box>
                </>
              )}
            </div>
          </div>
        )}
      </Card>
      {/* {episodeInfo && <div id={'under'} className={classes.undeground}>-</div>} */}
    </>
  ) : (
    <></>
  );
};

MediaControlCard.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(MediaControlCard);
