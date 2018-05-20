import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import Typography from '@material-ui/core/Typography';
import {clearText} from './index';
// const toMinutes = time => {
//   return Math.floor(1 * time / 60) + ":" + (1 * time) % 60;
// };

const styles = theme => ({
  root: {
    width: "100%"
  }
});

function EpisodeList(props) {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <Card>
        <List>
          {props.episodes &&
            props.episodes.map(episode => (
              <div key={episode.guid}>
                <ListItem
                  button
                  onClick={props.handler}
                  data-guid={episode.guid}
                >
                {(props.playing === episode.guid && props.status !== 'pause') ?
              <PauseIcon className={classes.playIcon} /> :
              <PlayArrowIcon className={classes.playIcon} />
            }
                  <ListItemText 
                    primary={<Typography component="span" variant="subheading" noWrap>{clearText(episode.title)}</Typography>}
                    secondary={<Typography component="span" color="textSecondary" noWrap>{clearText(episode.content)}</Typography>}
                  />
                </ListItem>
                <Divider />
              </div>
            ))}
        </List>
      </Card>
    </div>
  );
}

EpisodeList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(EpisodeList);
