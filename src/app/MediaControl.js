import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
// import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Slider from '@material-ui/core/Slider';

// import CardMedia from "@material-ui/core/CardMedia";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import SkipPreviousIcon from "@material-ui/icons/Replay10";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/Forward30";
// import {clearText} from './index'
import LinearProgress from "@material-ui/core/LinearProgress";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";
import { Consumer } from "../App.js";


const styles = theme => ({
  card: {
    width:'100%'
  },
  details: {
    flexDirection: "column",
  },
  content: {
    flex: "1 0 auto"
  },
  cover: {
    width: 151,
    height: 151,
    margin: "30px"
  },
  controls: {
    paddingLeft: theme.spacing.unit,
    paddingBottom: theme.spacing.unit
  },
  left: {
    textAlign: "left"
  },
  line:{
    position:"absolute",
    bottom: "-10%",
    width:"100%"
  },
  trackAfter:{
    display:"none"
  },
  right: {
    textAlign: "right"
  },
  center: {
    textAlign: "center"
  },
  playIcon: {
    height: 45,
    width: 45
  },
  controlIcon: {
    height: 30,
    width: 30
  },
  player:{
    paddingLeft: 20,
    paddingRight: 20,
  },
  undeground:{
    height:130,
    width:'100%'
  },
  classNameProp:{
    position: 'absolute'
  },
  container:{
    position: 'relative'
  },
  root:{
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    position: 'fixed',
    bottom: 56,
    width: '100%',
    backgroundColor:'aliceblue',
    zIndex:50
  }
});

const convertMinsToHrsMins = (mins) => {
  if (!Number.isInteger(mins)) return '';
  let h = Math.floor(mins / 60);
  let m = mins % 60;
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  return `${h}:${m}`;
}

const toMinutes = (totalTime , currentTime) => {
  totalTime = Math.floor(totalTime - currentTime);
  if(!Number.isInteger(totalTime)) return '∞';
  return ( '- '+ convertMinsToHrsMins(totalTime) );
}

const toMin = (theTime) =>
typeof theTime === 'number' ? 
  convertMinsToHrsMins(Math.floor(theTime)) :
  `00:00` ;

//
function MediaControlCard(props) {
  const { classes, theme } = props;
  return (
    <Consumer>
    {({state, episode}) => (
    <div>
      <div className={classes.root} >

        {episode && (
          <div className={classes.card}>

            <div className={classes.details}>
              <Link to="/podcast">
              <CardContent className={classes.content}>
                <Typography  variant="body1">{episode.title}</Typography>
              </CardContent>
              </Link>

            <Grid container className={classes.player}>
                <Grid item xs={2}>
                  <span>{toMin(state.currentTime)}</span>
                </Grid>
                <Grid className={classes.container} item xs={8}>
                  <LinearProgress variant="buffer" value={state.played} valueBuffer={state.loaded} />
                  <div className={classes.line}>
                    <Slider value={state.played} aria-labelledby="audio" onChange={props.seek} />
                  </div>
                </Grid>
                <Grid item xs={2} className={classes.right}>
                  <span>{toMinutes(state.duration, state.currentTime)}</span>
                </Grid>
              </Grid>

              <Grid container className={classes.controls} >
                <Grid className={classes.right} item xs={4}>
                  <IconButton aria-label="Previous" onClick={props.rewind}>
                    {theme.direction === "rtl" ? (
                      <SkipNextIcon className={classes.controlIcon} />
                    ) : (
                      <SkipPreviousIcon className={classes.controlIcon} />
                    )}
                  </IconButton>
                </Grid>
                <Grid item xs={4} className={classes.center}>
                  <IconButton
                    aria-label="Play/pause"
                    onClick={props.handler}
                    data-guid={state.playing}
                  >
                    {state.playing === episode.guid &&
                    state.status !== "pause" ? (
                      <PauseIcon className={classes.playIcon} />
                    ) : (
                      <PlayArrowIcon className={classes.playIcon} />
                    )}
                  </IconButton>
                </Grid>
                <Grid item xs={4} className={classes.left}>
                  <IconButton aria-label="Next" onClick={props.forward}>
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
      { props.episode && <div className={classes.undeground}></div> }
    </div> )}
    </Consumer>
  );
}

MediaControlCard.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(MediaControlCard);
