import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
// import InfoIcon from '@material-ui/icons/Info';
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Add from "@material-ui/icons/Add";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";
import { getPodcastColor, cachedContent } from "../engine/podcast";
import { Consumer } from "../App.js";

export const styles = (theme) => ({
  podcastMedia: {
    paddingTop: "100%",
    position: "relative",
    cursor: "pointer",
  },
  podcastData: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "000",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  cardContent: {
    position: "absolute",
    width: 0,
  },
  relativeContainer: {
    position: "relative",
  },
  addIcon: {
    width: "3em",
    height: "3em",
  },
  card: {
    height: "100%",
    width: "100%",
  },
  progress: {
    margin: theme.spacing(2),
  },
  progressContainer: {
    width: 0,
    margin: "auto",
  },
  addMorebutton: {
    position: "absolute",
    zIndex: 1,
    bottom: 0,
    right: "1em",
    bottom: "5em",
    margin: "0 auto",
  },
});

const addMore = "addmore";

const getMyColor = (cast) =>
  cast.domain === addMore
    ? { backgroundColor: "white" }
    : getPodcastColor(cast);

function PodCastGrid(props) {
  const { classes } = props;

  return (
    <Consumer>
      {({ state, global }) => {
        const processClick = (ev) => {
          global.loadPodcastToView(ev).then(props.actionAfterSelectPodcast);
        };

        const casts = (state.podcasts && [...state.podcasts]) || [];

        return (
          <>
            <AppBar position="static">
              <Toolbar variant="dense">
                <Typography variant="h6">Library</Typography>
              </Toolbar>
            </AppBar>
            <Fab
              color="secondary"
              aria-label="add"
              className={classes.addMorebutton}
              onClick={() => props.addPodcastHandler()}
            >
              <AddIcon />
            </Fab>
            <Grid container spacing={0} direction={"row"}>
              {casts &&
                casts.map(
                  (cast) =>
                    cast &&
                    cast.domain && (
                      <Grid item xs={4} md={2} lg={1} key={cast.domain}>
                        <Card
                          classes={{ root: classes.card }}
                          style={getMyColor(cast)}
                        >
                          <div className={classes.relativeContainer}>
                            <CardContent className={classes.cardContent}>
                              {cast.title}
                            </CardContent>
                            <CardMedia
                              onClick={processClick}
                              domain={cast.domain}
                              title={cast.title}
                              className={classes.podcastMedia}
                              image={cast.image}
                            />
                          </div>
                        </Card>
                      </Grid>
                    )
                )}
            </Grid>
          </>
        );
      }}
    </Consumer>
  );
}

PodCastGrid.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PodCastGrid);
