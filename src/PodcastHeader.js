import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SkipNextIcon from '@material-ui/icons/SkipNext';
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
    width: 80,
    margin: 10,
    height: 40,
    padding: 40
  },
  playIcon: {
    height: 38,
    width: 38,
  },
});

function MediaControlCard(props) {
  const { classes, theme } = props;

  return (
    <div>
      <Card className={classes.card}>
      <CardMedia
          className={classes.cover}
          image={props.image}
          title="Live from space album cover"
        />
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography variant="headline">{props.title}</Typography>
            <Typography color="textSecondary">
              {clearText(props.description)}
            </Typography>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

MediaControlCard.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(MediaControlCard);