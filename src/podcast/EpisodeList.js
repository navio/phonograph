import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import EpisodeView from "./EpisodeView";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogContent from "@material-ui/core/DialogContent";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Chip from "@material-ui/core/Chip";
import createDOMPurify from "dompurify";
import { Consumer } from "../App.js";

// const toMinutes = time => {
//   return Math.floor(1 * time / 60) + ":" + (1 * time) % 60;
// };
const DOMPurify = createDOMPurify(window);
const { sanitize } = DOMPurify;

export const clearText = (html) => {
  let tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText;
};

export const styles = (theme) => ({
  root: {
    // width: "100%",
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

const EpisodeListDescription = (props) => {
  const episode = props.episode;

  return (
    <ListItemText
      {...props}
      primary={
        <>
        {episode.season && (<Typography color={'secondary'}>Season {episode.season}</Typography>)}
          <Typography component="div" variant="subtitle1" noWrap>
            {clearText(episode.title)} 
            {episode.episodeType && episode.episodeType !== "full" && (
              <Chip
                style={{marginLeft:'10px'}}
                variant="outlined"
                size="small"
                label={episode.episodeType}
                color="secondary"
              />
            )}
          </Typography>
          <Typography variant="overline" component="div">
            {episodeDate(episode.created)}
          </Typography>
        </>
      }
    />
  );
};

const Description = (props) => {
  const { title, description } = props.open || {};
  return (
    props.open && (
      <Dialog
        onClose={props.handleClose}
        aria-labelledby="simple-dialog-title"
        open={!!props.open}
      >
        <DialogTitle id="simple-dialog-title">
          <span dangerouslySetInnerHTML={{ __html: sanitize(title) }} />
        </DialogTitle>
        <DialogContent>
          <div dangerouslySetInnerHTML={{ __html: sanitize(description) }} />
        </DialogContent>
      </Dialog>
    )
  );
};

const EpisodeList = (props) => {
  window && window.scrollTo && window.scrollTo(0, 0);
  const [open, setOpen] = React.useState(null);
  const { classes } = props;

  const handleClose = (value) => {
    setOpen(null);
    setSelectedValue(value);
  };

  return (
    <>
      <Description handleClose={handleClose} open={open} />
      <Consumer>
        {(state) => (
          <div className={classes.root}>
            {props.episodes ? (
              <List>
                {props.episodes.map((episode, id) => (
                  <div key={episode.guid}>
                    <ListItem
                      className={
                        state.playing === episode.guid ? classes.selected : null
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
                      <EpisodeListDescription
                        onClick={() => {
                          console.log(episode);
                          setOpen({
                            description: episode.description,
                            title: episode.title,
                          });
                        }}
                        episode={episode}
                      />
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
          </div>
        )}
      </Consumer>
    </>
  );
};

EpisodeList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EpisodeList);
