import React, { useContext } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import { useTheme } from "@mui/material/styles";

import { AppContext } from "../App";
import { AppContextValue, PodcastEntry } from "../types/app";
import phono from "../../public/phono.svg";

const randomColor = (min: number, max: number) => Math.floor(Math.random() * max + min);

interface LibraryProps {
  addPodcastHandler: () => void;
  actionAfterSelectPodcast: () => void;
}

const LibraryView: React.FC<LibraryProps> = ({ addPodcastHandler, actionAfterSelectPodcast }) => {
  const theme = useTheme();
  const { state, dispatch } = useContext(AppContext) as AppContextValue;
  const podcasts = state.podcasts as PodcastEntry[];
  const colorSwatches = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
    theme.palette.secondary.light,
    theme.palette.secondary.main,
    theme.palette.secondary.dark,
  ];

  const processClick = (domain: string) => {
    dispatch({ type: "loadPodcast", payload: domain });
    actionAfterSelectPodcast();
  };

  return (
    <>
      <AppBar sx={{ WebkitAppRegion: "drag" }} position="static">
        <Toolbar variant="dense">
          <Typography variant="h6">Library</Typography>
        </Toolbar>
      </AppBar>
      <Fab
        color="secondary"
        aria-label="add"
        sx={{
          position: "fixed",
          zIndex: 1,
          right: "8%",
          bottom: "18%",
          margin: "0 auto",
        }}
        onClick={() => addPodcastHandler()}
      >
        <AddIcon />
      </Fab>
      <Grid container spacing={0} direction={"row"}>
        {podcasts.length > 0 ? (
          podcasts.map(
            (podcast) =>
              podcast &&
              podcast.domain && (
                <Grid item xs={3} sm={2} md={1} key={podcast.domain || podcast.feed || podcast.title || Math.random()}>
                  <Card raised={true}>
                    <div style={{ backgroundColor: colorSwatches[randomColor(0, 6)] }}>
                      <CardMedia
                        tabIndex={1}
                        onClick={() => processClick(podcast.domain as string)}
                        title={podcast.title}
                        sx={{
                          paddingTop: "100%",
                          position: "relative",
                          cursor: "pointer",
                        }}
                        image={podcast.image || undefined}
                      />
                    </div>
                  </Card>
                </Grid>
              )
          )
        ) : (
          <Typography
            sx={{
              display: "block",
              width: "100%",
              marginTop: "18%",
              color: theme.palette.text.secondary,
            }}
            align="center"
            variant="h5"
          >
            <img width={"85rem"} src={phono} />
            <br />
            No podcasts bookmarked.
          </Typography>
        )}
      </Grid>
    </>
  );
};

export default LibraryView;
