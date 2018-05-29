import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import {clearText} from './EpisodeList'

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
  desc:{
    maxHeight: '100px',
    overflow: 'hidden'
  }
});


function PodcastHeader(props) {
  const { classes } = props;

  return (
    <div>
      <Card className={classes.card}>
      {props.image && <CardMedia
          className={classes.cover}
          image={props.image}
          title={`${props.title} cover`}
        />}
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography variant="headline" noWrap>{props.title}</Typography>
            <Typography className={classes.desc} color="textSecondary">
              {clearText(props.description)}
            </Typography>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

PodcastHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(PodcastHeader);