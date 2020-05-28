import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Hidden, Box, Button, TextField } from "@material-ui/core";
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

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import { Consumer } from "../../App.js";
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
    margin: 10,
    padding: 40,
    height: "20em",
  },
  coverSM: {
    // margin: 10,
    // padding: 40,
    height: "20em",
  },
  playIcon: {
    height: 38,
    width: 38,
  },
  addToLibrary: {
    float: "right",
  },
  desc: {
    maxHeight: "14vh",
    marginTop: "1em",
    overflow: "hidden",
    marginLeft: ".5em",
    paddingRight: "1em"
  },
  title: {
    marginTop: 3,
    whiteSpace: "pre-wrap",
    marginLeft: 10,
    paddingRight: "1em",
    lineClamp: 2
  },
  appHeader: {
    WebkitAppRegion: 'drag',
  }
});

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function PodcastHeader(props) {
  const { classes, inLibrary, savePodcast, removePodcast } = props;
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  let history = useHistory();
  const isInLibrary = inLibrary()
  const saveThisPodcastToLibrary = (ev) => {
    savePodcast(ev);
    setMessage("Podcast Added to Library");
    setOpen(true);
  };

  const backHandler = () => history.goBack();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  // const colorThief = new ColorThief();

  const makeMeAHash = (url) => btoa(url);


  const shareLink = !!(navigator.share || navigator.clipboard);
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
        setMessage("Link copied to clipboard");
        setOpen(true);
      };
    } else {
      return false;
    }
  };

  return (
    <Consumer>
      {(data) => {
        const state = props.podcast;
        return (
          <>
            <Snackbar
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              autoHideDuration={4000}
            >
              <Alert severity="success">{message}</Alert>
            </Snackbar>
            <AppBar className={classes.appHeader} position="static">
              <Toolbar variant="dense">
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h6">
                      <IconButton
                        size="small"
                        aria-label="back"
                        onClick={backHandler}
                      >
                        <ArrowBackIcon style={{ color: "#fff" }} />
                      </IconButton>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    {isInLibrary ? (
                      <Tooltip title="Remove from library" placement="bottom">
                        <IconButton
                          className={classes.addToLibrary}
                          size="small"
                          style={{ color: "#fff" }}
                          onClick={removePodcast}
                          aria-label="Remove from Library"
                        >
                          <Favorite />
                        </IconButton>
                      </Tooltip>
                    ) : (
                        <Tooltip title="Add to Library" placement="bottom">
                          <IconButton
                            size="small"
                            style={{ color: "#fff" }}
                            onClick={saveThisPodcastToLibrary}
                            className={classes.addToLibrary}
                          >
                            <BookmarkBorderIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    {shareLink && (
                      <Tooltip title="Share Podcast" placement="bottom">
                        <IconButton
                          style={{ color: "#fff" }}
                          size="small"
                          className={classes.addToLibrary}
                          onClick={share(
                            "Phonograph",
                            state.title,
                            `${document.location.origin}/podcast/${makeMeAHash(state.domain)}`
                          )}
                        >
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Grid>
                </Grid>
              </Toolbar>
            </AppBar>
            <Grid style={{ paddingBottom: "1em" }} elevation={3} container >
              <Grid item xs={12} md={4}>
                {state.image && (
                  <>
                  <Hidden smDown >
                    <CardMedia
                      className={classes.cover}
                      image={state.image}
                      title={`${state.title} cover`}
                    />
                  </Hidden>
                   <Hidden mdUp>
                   <CardMedia
                     className={classes.coverSM}
                     image={state.image}
                     title={`${state.title} cover`}
                   />
                 </Hidden>
                </>
                )}
              </Grid>
              <Grid item sm={12} md={8}>
                <Box mb='1rem'>
                  <Hidden smDown >
                    <Typography className={classes.title} variant="h4" noWrap>
                      {state.title}
                    </Typography>
                    <Typography
                      align={"justify"}
                      className={classes.desc}
                      color="textSecondary"
                    >
                      {clearText(state.description)}
                    </Typography>
                  </Hidden>
                  <Hidden mdUp>
                    <ExpansionPanel>
                      <ExpansionPanelSummary>
                        <Typography className={classes.title} variant="h4" noWrap>
                          {state.title}
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        {clearText(state.description)}
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </Hidden>
                </Box>
              </Grid>
              <Grid item xs={12} pt={2} align="right">
                {!isInLibrary &&
                  <Button onClick={saveThisPodcastToLibrary}
                    style={{ marginRight: '1rem' }} variant="outlined" color="primary" >Subscribe</Button>}
              </Grid>
              <Grid item xs={12}>
                <Typography style={{ marginLeft: '.5rem' }}>
                  <b>Episodes:</b> {state.items.length}
                </Typography>
              </Grid>
            </Grid>
          </>
        );
      }}
    </Consumer>
  );
}

PodcastHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(PodcastHeader);
