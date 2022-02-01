import React, {useContext, useEffect} from "react";
import withStyles from '@mui/styles/withStyles';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import { AppContext } from "../App.js";
import phono from '../../public/phono.svg';
import ButtonBase from '@mui/material/ButtonBase';


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
    // position: "absolute",
    width: 0,
  },
  relativeContainer: {
    // position: "relative",
    backgroundColor: theme.palette.secondary.light
  },
  addIcon: {
    width: "3em",
    height: "3em",
  },
  card: {
    // backgroundColor: 'red'
  },
  progress: {
    margin: theme.spacing(2),
  },
  progressContainer: {
    width: 0,
    margin: "auto",
  },
  addMorebutton: {
    position: "fixed",
    zIndex: 1,
    bottom: 0,
    right: "8%",
    bottom: "18%",
    margin: "0 auto",
  },
  empty: {
    display:"block",
    width:"100%",
    marginTop:"18%",
    color: theme.palette.text.secondary
  },
  appHeader: {
    WebkitAppRegion: 'drag',
  },
  a0:{
    backgroundColor: theme.palette.primary.light,
  },
  a1:{
    backgroundColor: theme.palette.primary.main,
  },
  a2:{
    backgroundColor: theme.palette.primary.dark,
  },
  a3:{
    backgroundColor: theme.palette.secondary.light,
  },
  a4:{
    backgroundColor: theme.palette.secondary.main,
  },
  a5:{
    backgroundColor: theme.palette.secondary.dark,
  }
});

const randomColor = (min, max) => Math.floor((Math.random() * max) + min);

const LibraryView = (props) => {
  const { classes, actionAfterSelectPodcast, history } = props;
  const {state , dispatch, debug } = useContext(AppContext);
  const cachedRoute = debug ? '' : '/image/'
  const podcasts = state.podcasts;
        const processClick = (ev) => {
          const podcast = ev.currentTarget && ev.currentTarget.getAttribute('domain');
          dispatch({type:'loadPodcast', payload: podcast});
          actionAfterSelectPodcast();
        };
        return <>
            <AppBar className={classes.appHeader} position="static">
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
              {podcasts.length > 0 ?
                podcasts.map(
                  (podcast) =>
                    podcast &&
                    podcast.domain && 
                      <Grid item xs={3} sm={2} md={1}  key={podcast.domain} >
                        <Card
                          raised={true}
                          classes={{ root: classes.card }}                
                        >
                          <div className={classes['a'+ randomColor(0,6) ]}>
                            {/* <CardContent className={classes.cardContent}>
                              {podcast.title}
                            </CardContent> */}
                            <CardMedia tabIndex="1"
                              onClick={processClick}
                              domain={podcast.domain}
                              title={podcast.title}
                              className={classes.podcastMedia}
                              image={(podcast.image)}
                            />
                          </div>
                        </Card>
                      </Grid>
                ) : 
                <Typography className={classes.empty} align="center" variant="h5">
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

export default withStyles(styles)(LibraryView);
