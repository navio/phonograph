import React, { useContext } from "react";
// import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import { AppContext } from "../App.js";
import phono from '../../public/phono.svg';
import { useTheme } from "@mui/material/styles";

const randomColor = (min, max) => Math.floor((Math.random() * max) + min);

const LibraryView = (props) => {
  const theme = useTheme();
  const { actionAfterSelectPodcast, history } = props;
  const {state , dispatch, debug } = useContext(AppContext);
  const cachedRoute = debug ? '' : '/image/'
  const podcasts = state.podcasts;
  const colorSwatches = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
    theme.palette.secondary.light,
    theme.palette.secondary.main,
    theme.palette.secondary.dark,
  ];
        const processClick = (ev) => {
          const podcast = ev.currentTarget && ev.currentTarget.getAttribute('domain');
          dispatch({type:'loadPodcast', payload: podcast});
          actionAfterSelectPodcast();
        };
        return <>
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
              onClick={() => props.addPodcastHandler()}
            >
              <AddIcon />
            </Fab>
            <Grid container spacing={0} direction={"row"}>
              {podcasts.length > 0 ?
                podcasts.map(
                  (podcast) =>
                    podcast &&
                    podcast.domain && 
                      <Grid item xs={3} sm={2} md={1}  key={podcast.domain} >
                        <Card
                          raised={true}
                        >
                          <div style={{ backgroundColor: colorSwatches[randomColor(0, 6)] }}>
                            {/* <CardContent className={classes.cardContent}>
                              {podcast.title}
                            </CardContent> */}
                            <CardMedia tabIndex="1"
                              onClick={processClick}
                              domain={podcast.domain}
                              title={podcast.title}
                              sx={{
                                paddingTop: "100%",
                                position: "relative",
                                cursor: "pointer",
                              }}
                              image={(podcast.image)}
                            />
                          </div>
                        </Card>
                      </Grid>
                ) : 
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
                    <img width={'85rem'} src={phono} />
                      <br />
                  No podcasts bookmarked.
                </Typography>}
            </Grid>
          </>;
}

// LibraryView.propTypes = {
//   classes: PropTypes.object.isRequired,
// };

export default LibraryView;
