import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';

import Favorite from "@material-ui/icons/Favorite";
import AddIcon from '@material-ui/icons/Add';

import {clearText} from './EpisodeList'
import { Consumer } from "../App.js";

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
    width: 80,
    margin: 10,
    height: 40,
    padding: 40
  },
  playIcon: {
    height: 38,
    width: 38,
  },
  addToLibrary:{
    float:"right"
  },
  desc:{
    maxHeight: '100px',
    overflow: 'hidden'
  },
  title:{
    whiteSpace: "pre-wrap"
  }
});


function PodcastHeader(props) {
  const { classes, inLibrary, savePodcastToLibrary, removePodcast } = props;
  const isInLibrary = inLibrary();
  return (
    <Consumer>
      {({state}) =>  ( <Card className={classes.card}>
      {state.image && <CardMedia
          className={classes.cover}
          image={state.image}
          title={`${state.title} cover`}
        />}
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography className={classes.title} variant="headline" noWrap>{state.title}
              { isInLibrary ? 
                <IconButton className={classes.addToLibrary} 
                  color="secondary" 
                  onClick={removePodcast} aria-label="Add" >
                  <Favorite />
                </IconButton>:
                <Button variant="outlined"
                        size="small" 
                        color="primary" 
                        onClick={savePodcastToLibrary} 
                        className={classes.addToLibrary} >
                <AddIcon />
              </Button> }
            </Typography>
            <Typography className={classes.desc} color="textSecondary">
              {clearText(state.description)}
            </Typography>
          </CardContent>
        </div>
      </Card>)
      }
    </Consumer>
  );
}

PodcastHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(PodcastHeader);