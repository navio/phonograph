import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import EpisodeView from "./EpisodeView";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Consumer } from "../App.js";

// const toMinutes = time => {
//   return Math.floor(1 * time / 60) + ":" + (1 * time) % 60;
// };

export const clearText = (html) => {
  let tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText;
};

export const styles = (theme) => ({
  root: {
    width: "100%",
  },
  selected: {
    backgroundColor: "aliceblue",
  },
  progress: {
    margin: theme.spacing(2),
  },
  progressContainer: {
    width: 0,
    margin: "auto",
  },
});
dayjs.extend(relativeTime);
const today = dayjs();
const episodeDate = (date) => today.from(date, true);

class EpisodeListDescription extends React.Component {
  constructor(props) {
    super();
    this.state = {
      open: true,
    };
    this.episode = props.episode;
  }
  render() {
    return (
      <ListItemText
        primary={
          <Typography component="div" variant="subtitle1" noWrap>
            {clearText(this.episode.title)}{" "}
            <Typography component="div">
              {episodeDate(this.episode.created)}
            </Typography>
          </Typography>
        }
        secondary={
          <Typography component="div" color="textSecondary" noWrap>
            {clearText(JSON.stringify(this.episode.description))}
          </Typography>
        }
      />
    );
  }
}

class EpisodeList extends React.Component {
  constructor(props) {
    super();
    window && window.scrollTo && window.scrollTo(0, 0);
  }

  render() {
    let props = this.props;
    let { classes } = this.props;
    return (
      <Consumer>
        {(state) => (
          <div className={classes.root}>
            <Card>
              {props.episodes ? (
                <List>
                  {props.episodes.map((episode, id) => (
                    <div key={episode.guid}>
                      <ListItem
                        className={
                          state.playing === episode.guid
                            ? classes.selected
                            : null
                        }
                        button
                      >
                        <ListItemIcon>
                          {props.playing === episode.guid &&
                          props.status !== "pause" ? (
                            <PauseIcon
                              className={classes.playIcon}
                              onClick={props.handler}
                              data-guid={episode.guid}
                            />
                          ) : (
                            <PlayArrowIcon
                              className={classes.playIcon}
                              onClick={props.handler}
                              data-guid={episode.guid}
                            />
                          )}
                        </ListItemIcon>
                        <EpisodeListDescription episode={episode} />
                      </ListItem>
                      <Divider />
                    </div>
                  ))}
                </List>
              ) : (
                <div className={classes.progressContainer}>
                  <CircularProgress className={classes.progress} />
                </div>
              )}
            </Card>
          </div>
        )}
      </Consumer>
    );
  }
}

EpisodeList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EpisodeList);
