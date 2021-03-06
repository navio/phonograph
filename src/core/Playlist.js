import React, { useContext } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { withStyles, fade } from "@material-ui/core/styles";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import phono from "../../public/phono.svg";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
} from "@material-ui/core";
import { AppContext } from "../App.js";

const styles = (theme) => ({
  images: {
    width: "2rem",
    marginRight: "1rem",
  },
  appHeader: {
    WebkitAppRegion: "drag",
  },
  empty: {
    display: "block",
    width: "100%",
    marginTop: "18%",
    color: theme.palette.text.secondary,
  },
});

const Playlist = ({ classes }) => {
  const { state, dispatch } = useContext(AppContext);
  const removeFromList = (episode) => () => {
    dispatch({ type: "removeFromPlayList", episode });
  };
  const removeAll = () => {
    dispatch({ type: "clearPlayList" });
  };
  return (
    <>
      <AppBar className={classes.appHeader} position="static">
        <Toolbar variant="dense">
          <Typography variant="h6">Playlist</Typography>
        </Toolbar>
      </AppBar>
      {state.playlist && state.playlist.length > 0 ? (
        <>
          <Box component="div" m={1}>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                <Typography variant="h6">Playing next:</Typography>
              </Grid>
              <Grid item zeroMinWidth>
                <Button
                  onClick={removeAll}
                  variant="contained"
                  color="secondary"
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Box>
          <List>
            <Paper variant="outlined">
              {state.playlist.map((mediaElement, key) => (
                <ListItem key={key}>
                  <img
                    className={classes.images}
                    src={mediaElement.podcastImage}
                  />
                  <ListItemText>
                    <Typography variant="body2" display="block" noWrap>
                      <b>{key + 1}:</b> {mediaElement.episodeInfo.title}{" "}
                    </Typography>
                    <Typography variant="caption" display="block" noWrap>
                      {mediaElement.episodeInfo.author}
                    </Typography>
                  </ListItemText>
                  <ListItemSecondaryAction>
                    <IconButton onClick={removeFromList(key)}>
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </Paper>
          </List>
        </>
      ) : (
        <Typography className={classes.empty} align="center" variant="h5">
          <img width={"85rem"} src={phono} />
          <br />
          Playlist is empty.
        </Typography>
      )}
    </>
  );
};

export default withStyles(styles)(Playlist);
