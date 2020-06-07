import React, { useContext } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography";
import { withStyles, fade } from "@material-ui/core/styles";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
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
});

const Playlist = ({ classes }) => {
  const { state, dispatch } = useContext(AppContext);
  const removeFromList = (episode) => () => dispatch({type:'removeFromList', episode});
  return (
    <>
      <AppBar className={classes.appHeader} position="static">
        <Toolbar variant="dense">
          <Typography variant="h6">PlayList</Typography>
        </Toolbar>
      </AppBar>
      <Paper>
      <Box component="div" m={1}>
        <Grid
          container
          direction="row"
          justify="flex-end"
          spacing={2}
          alignItems="center"
        >
          <Grid item>
              <Button variant="contained" color="secondary">
                Clear
              </Button>
          </Grid>
        </Grid>
        </Box>
        <List>
          {state.playlist && state.playlist.map((mediaElement, key) => (
            <ListItem key={key}>
              <img className={classes.images} src={mediaElement.podcastImage} />
              <div>
                  <Typography variant='body2' display="block" noWrap>{mediaElement.episodeInfo.title} </Typography>
                  <Typography variant='caption' display="block" noWrap>{mediaElement.episodeInfo.author}</Typography>
              </div>
              <ListItemSecondaryAction>
                <IconButton onClick={removeFromList(key)}>
                    <RemoveCircleOutlineIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
    </>
  );
};

export default withStyles(styles)(Playlist);
