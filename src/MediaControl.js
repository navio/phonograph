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
import {clearText} from './index'

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
  // props.episode && console.log(props.episode);
  console.log('player state',props.loading)
  return (
    <div>
      {props.episode && <Card className={classes.card}>
        <div className={classes.details}>
        
        {props.loading && props.loading === 'loaded' && <div className={classes.controls}>
            <IconButton aria-label="Previous" onClick={props.rewind}>
              { theme.direction === "rtl" ? <SkipNextIcon className={classes.controlIcon} /> : <SkipPreviousIcon  className={classes.controlIcon} /> }
            </IconButton>

            <IconButton aria-label="Play/pause" onClick={props.handler} data-guid={props.playing}>
            {(props.playing === props.episode.guid && props.status !== 'pause') ?
              <PauseIcon className={classes.playIcon}  /> :
              <PlayArrowIcon className={classes.playIcon}  />
            }
            </IconButton>
            
            <IconButton aria-label="Next" onClick={props.forward}>
              {theme.direction === "rtl" ? <SkipPreviousIcon className={classes.controlIcon}  />: <SkipNextIcon className={classes.controlIcon} />}
            </IconButton>
          </div> }
          <CardContent className={classes.content}>
            <Typography variant="title">{props.episode.title}</Typography>
            <Typography style={{ paddingTop: 10 }} color="textSecondary" dangerouslySetInnerHTML={{__html: props.episode.content}} >
            </Typography>
          </CardContent>
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