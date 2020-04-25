import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import Favorite from "@material-ui/icons/Bookmark";
import BookmarkBorderIcon from "@material-ui/icons/BookmarkBorder";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { clearText } from "./EpisodeList";
import ShareIcon from "@material-ui/icons/ShareOutlined";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { Consumer } from "../App.js";
import { useHistory } from "react-router-dom";

const styles = (theme) => ({
  card: {
    display: "flex",
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: "1 0 auto",
  },
  cover: {
    width: 80,
    margin: 10,
    height: 40,
    padding: 40,
  },
  playIcon: {
    height: 38,
    width: 38,
  },
  addToLibrary: {
    float: "right",
  },
  desc: {
    maxHeight: "100px",
    overflow: "hidden",
  },
  title: {
    whiteSpace: "pre-wrap",
  },
});



function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function PodcastHeader(props) {
  const { classes, inLibrary, savePodcastToLibrary, removePodcast } = props;
  const isInLibrary = inLibrary();
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  let history = useHistory();

  const saveThisPodcastToLibrary = (ev) => {
    savePodcastToLibrary(ev);
    setMessage("Podcast Added to Library")
    setOpen(true);
  };

  const backHandler = () => history.goBack();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };
  const shareLink = !!(navigator.share || navigator.clipboard)
  const share = (title, text, url) => {
    if (navigator.share) {
      return () =>
        navigator.share({
          title,
          text,
          url,
        });
    } else if (navigator.clipboard) {
      return () => {
        navigator.clipboard.writeText(`${title} ${url.toString()}`);
        setMessage("Link csopied to clipboard")
        setOpen(true);
      };
    } else {
      return false;
    }
  };

  return (
    <Consumer>
      {({ state }) => (
        <>
          <Snackbar
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            autoHideDuration={4000}
          >
            <Alert severity="success">{message}</Alert>
          </Snackbar>
          <AppBar position="static">
            <Toolbar variant="dense">
              <Grid container>
                <Grid item xs={6}>
                  <Typography variant="h6">
                    <IconButton
                      size="small"
                      aria-label="back"
                      onClick={backHandler}
                    >
                      <ArrowBackIcon style={{ color: '#fff' }} />
                    </IconButton>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  {isInLibrary ? (
                    <Tooltip title="Remove from library" placement="bottom">
                    <IconButton
                      className={classes.addToLibrary}
                      color="secondary"
                      size="small"
                      onClick={removePodcast}
                      aria-label="Remove from Library"
                    >
                      <Favorite />
                    </IconButton></Tooltip>
                  ) : (
                    <Tooltip title="Add to Library" placement="bottom">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={saveThisPodcastToLibrary}
                        className={classes.addToLibrary}
                      >
                        <BookmarkBorderIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {shareLink && <Tooltip title="Share Podcast" placement="bottom"><IconButton
                    color="secondary"
                    size="small"
                    className={classes.addToLibrary}
                    onClick={share(
                      "Phonograph",
                      state.title,
                      `${document.location.origin}?podcast=${state.domain}`
                    )}
                  >
                    <ShareIcon />
                  </IconButton></Tooltip>}
                </Grid>
              </Grid>
            </Toolbar>
          </AppBar>
          <Card className={classes.card}>
            {state.image && (
              <CardMedia
                className={classes.cover}
                image={state.image}
                title={`${state.title} cover`}
              />
            )}
            <div className={classes.details}>
              <CardContent className={classes.content}>
                <Typography className={classes.title} variant="h4" noWrap>
                  {state.title}
                </Typography>
                <Typography className={classes.desc} color="textSecondary">
                  {clearText(state.description)}
                </Typography>
              </CardContent>
            </div>
          </Card>
        </>
      )}
    </Consumer>
  );
}

PodcastHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(PodcastHeader);
