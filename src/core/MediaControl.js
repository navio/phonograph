import React, {useContext} from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Slider from "@material-ui/core/Slider";
import { useHistory } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import SkipPreviousIcon from "@material-ui/icons/Replay10";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/Forward30";
import LinearProgress from "@material-ui/core/LinearProgress";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";
import { AppContext } from "../App.js";
import {
  PODCASTVIEW,
} from "../constants";

const styles = (theme) => ({
  card: {
    width: "100%",
  },
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
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  left: {
    textAlign: "left",
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
  right: {
    textAlign: "right",
    padding: 0,
  },
  center: {
    textAlign: "center",
    padding: 0,
  },
  playIcon: {
    height: 45,
    width: 45,
  },
  controlIcon: {
    height: 30,
    width: 30,
    color: theme.palette.secondary.main
  },
  player: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  undeground: {
    display:"block",
    height: '8.5rem',
    width: "100%",
  },
  classNameProp: {
    position: "absolute",
  },
  container: {
    position: "relative",
  },
  title: { paddingTop: "10px", paddingBottom: "10px", color: theme.palette.text.primary },
  root: {
    borderTop: "2px solid",
    borderColor: theme.palette.secondary.main,
    position: "fixed",
    bottom: 56,
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    zIndex: 50,
    // height: "calc(100% - 3.5rem)",
  },
});

const convertMinsToHrsMins = (mins) => {
  if (!Number.isInteger(mins)) return "";
  let h = Math.floor(mins / 60);
  let m = mins % 60;
  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  return `${h}:${m}`;
};



const toMinutes = (totalTime, currentTime) => {
  totalTime = Math.floor(totalTime - currentTime);
  if (!Number.isInteger(totalTime)) return "∞";
  return "- " + convertMinsToHrsMins(totalTime);
};

const toMin = (theTime) =>
  typeof theTime === "number"
    ? convertMinsToHrsMins(Math.floor(theTime))
    : `00:00`;

//
function MediaControlCard(props) {
  const {state, dispatch} = useContext(AppContext);
  const { classes, theme } = props;
  const history = useHistory();

  const toOrigin = (audioOrigin) => () => {
    console.log('redirect')
    dispatch({type: 'updateCurrent', payload:audioOrigin});
    history.push(PODCASTVIEW)
  }
  const {episodeInfo = {} } = state;
  // console.log(episodeInfo)
  return (
        <>
          <div className={classes.root}>
            {state.episodeInfo && (
              <div className={classes.card}>
                <div className={classes.details}>
                    <Typography
                      onClick={toOrigin(state.audioOrigin)}
                      align={"center"}
                      className={classes.title}
                      variant="h6"
                      noWrap
                      style={{ paddingLeft: '4rem', paddingRight: '4rem'}}
                    > 
                      {episodeInfo.title}
                    </Typography>

                    {/* <Typography>
                      {episodeInfo.description}
                    </Typography> */}

                  <Grid container className={classes.player}>
                    <Grid item xs={2}>
                      <span>{toMin(state.currentTime)}</span>
                    </Grid>
                    <Grid className={classes.container} item xs={8}>
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
                    <Grid item xs={2} className={classes.right}>
                      <span>
                        {toMinutes(state.duration, state.currentTime)}
                      </span>
                    </Grid>
                  </Grid>

                  <Grid container className={classes.controls}>
                    <Grid className={classes.right} item xs={4}>
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
                    <Grid item xs={4} className={classes.center}>
                      <IconButton
                        style={{ padding: "0" }}
                        aria-label="Play/pause"
                        onClick={()=>props.handler()}
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
                    <Grid item xs={4} className={classes.left}>
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
                </div>
              </div>
            )}
          </div>
          {episodeInfo && <div id={'under'} className={classes.undeground}>-</div>}
        </>
  );
}

MediaControlCard.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(MediaControlCard);
