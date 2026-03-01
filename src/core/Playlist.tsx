import React, { useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { FormattedMessage, useIntl } from "react-intl";
import phono from "../../public/phono.svg";
import {
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import { AppContext } from "../App";
import { AppContextValue, PlaylistItem } from "../types/app";

const Playlist: React.FC = () => {
  const { state, dispatch } = useContext(AppContext) as AppContextValue;
  const intl = useIntl();
  const removeFromList = (episode: number) => () => {
    dispatch({ type: "removeFromPlayList", episode });
  };
  const removeAll = () => {
    dispatch({ type: "clearPlayList" });
  };
  return (
    <>
      <AppBar sx={{ WebkitAppRegion: "drag" }} position="static">
        <Toolbar variant="dense">
          <Typography variant="h6">
            <FormattedMessage id="playlist.title" defaultMessage="Playlist" />
          </Typography>
        </Toolbar>
      </AppBar>
      {state.playlist && state.playlist.length > 0 ? (
        <>
          <Box component="div" m={1}>
            <Grid
              container
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Grid item>
                <Typography variant="h6">
                  <FormattedMessage id="playlist.playingNext" defaultMessage="Playing next:" />
                </Typography>
              </Grid>
              <Grid item zeroMinWidth>
                <Button
                  onClick={removeAll}
                  variant="contained"
                  color="secondary"
                >
                  <FormattedMessage id="common.clear" defaultMessage="Clear" />
                </Button>
              </Grid>
            </Grid>
          </Box>
          <List>
            <Paper variant="outlined">
              {state.playlist.map((mediaElement: PlaylistItem, key: number) => (
                <ListItem
                  key={key}
                  secondaryAction={
                    <IconButton onClick={removeFromList(key)}>
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  }
                >
                  <img
                    style={{ width: "2rem", marginRight: "1rem" }}
                    src={mediaElement.podcastImage}
                    alt={mediaElement.title || intl.formatMessage({ id: "common.podcast", defaultMessage: "podcast" })}
                  />
                  <ListItemText>
                    <Typography variant="body2" display="block" noWrap>
                      <b>{key + 1}:</b> {mediaElement.episodeInfo?.title || ""}{" "}
                    </Typography>
                    <Typography variant="caption" display="block" noWrap>
                      {mediaElement.episodeInfo?.author || ""}
                    </Typography>
                  </ListItemText>
                </ListItem>
              ))}
            </Paper>
          </List>
        </>
      ) : (
        <Typography
          sx={(theme) => ({
            display: "block",
            width: "100%",
            marginTop: "18%",
            color: theme.palette.text.secondary,
          })}
          align="center"
          variant="h5"
        >
          <img width={"85rem"} src={phono} />
          <br />
          <FormattedMessage id="playlist.empty" defaultMessage="Playlist is empty." />
        </Typography>
      )}
    </>
  );
};

export default Playlist;
