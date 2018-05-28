import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

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
    marginTop: "5px"
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
  root:{
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    position: 'fixed',
    bottom: 56,
    width: '100%',
    backgroundColor:'#fff',
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
typeof theTime === 'number'  ? convertMinsToHrsMins(Math.floor(theTime)) : `00:00` ;


function MediaControlCard(props) {
  const { classes, theme } = props;

  return (
    <div className={classes.root}>
      {props.episode && (
        <div className={classes.card}>
          <div className={classes.details}>
            
            <CardContent className={classes.content}>
              <Typography variant="title">{props.episode.title}</Typography>
              {/*<Typography
                style={{ paddingTop: 10 }}
                color="textSecondary"
                dangerouslySetInnerHTML={{ __html: props.episode.content }}
              />*/}
            </CardContent>

           <Grid container className={classes.player}>
              <Grid item xs={2}>
                <span>{toMin(props.currentTime)}</span>
              </Grid>
              <Grid item xs={8}>
                <LinearProgress variant="buffer" className={classes.line} value={props.played} valueBuffer={props.loaded} />
              </Grid>
              <Grid item xs={2} className={classes.right}>
                <span>{toMinutes(props.totalTime,props.currentTime)}</span>
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
                  data-guid={props.playing}
                >
                  {props.playing === props.episode.guid &&
                  props.status !== "pause" ? (
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
  );
}

MediaControlCard.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(MediaControlCard);