import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import SkipPreviousIcon from '@material-ui/icons/Replay10';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import SkipNextIcon from '@material-ui/icons/Forward30';

const styles = theme => ({
  card: {
    display: 'flex',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
  },
  cover: {
    width: 151,
    height: 151,
    margin: '30px'
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  },
  playIcon: {
    height: 45,
    width: 45,
  },
  controlIcon:{
    height: 30,
    width: 30,
  }
});



function MediaControlCard(props) {
  const { classes, theme } = props;
    console.log(props.episode);
  return (
    <div>
      {props.episode && <Card className={classes.card}>
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography variant="headline">{props.episode.title}</Typography>
            <Typography variant="subheading" color="textSecondary">
              {props.episode.content}
            </Typography>
          </CardContent>
          <div className={classes.controls}>
            <IconButton aria-label="Previous">
              { theme.direction === "rtl" ? <SkipNextIcon className={classes.controlIcon} /> : <SkipPreviousIcon  className={classes.controlIcon} /> }
            </IconButton>

            <IconButton aria-label="Play/pause" onClick={props.handler} data-guid={props.playing}>
            {(props.playing === props.episode.guid && props.status !== 'pause') ?
              <PauseIcon className={classes.playIcon}  /> :
              <PlayArrowIcon className={classes.playIcon}  />
            }
            </IconButton>
            
            <IconButton aria-label="Next">
              {theme.direction === "rtl" ? <SkipPreviousIcon className={classes.controlIcon}  />: <SkipNextIcon className={classes.controlIcon} />}
            </IconButton>
          </div>
        </div>
        {/* <CardMedia
          className={classes.cover}
          image={props.episode.itunes.image}
          title={`${props.title} cover`}
        /> */}
      </Card> }
    </div>
  );
}

MediaControlCard.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(MediaControlCard);