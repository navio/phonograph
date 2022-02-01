import React, { Component } from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import withStyles from '@mui/styles/withStyles';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Backdrop from "@mui/material/Backdrop";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
// import Geners from './Geners';
// import QuickSearch from "./Search";
import Search from "./Search";
import Loading from '../../core/Loading';

// import Curated from "./curated.json";

import { getPopularPodcasts, searchForPodcasts } from './engine';


const styles = (theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  cover: {
    height: 151,
  },
  cardPointerValue: {
    // position: "absolute",
    // width: 0,
    cursor: "pointer",
  },
  relativeContainer: {
    position: "relative",
  },
  card: {
    height: "90px",
    width: "100%",
  },
  progress: {
    margin: theme.spacing(2),
  },
  progressContainer: {
    width: 0,
    margin: "auto",
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  appHeader: {
    WebkitAppRegion: 'drag',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
});

const Header = ({ searchHandler, classes }) => (
  <AppBar  className={classes.appHeader}  position="static">
    <Grid>
      <Toolbar variant="dense">
        <Grid item xs={8}>
          <Typography variant="h6">Discover</Typography>
        </Grid>
        <Grid item md={4} xs={12}>
          {/* <QuickSearch onChange={searchHandler} /> */}
        </Grid>
      </Toolbar>
    </Grid>
  </AppBar>
);

const getFinalURL = async (url) => {
  const URL = `${window.location.origin}/api/findFinal/?term=${url}`;
  try {
    const data = await fetch(URL);
    const result = await data.json();
    
    return result.url;
  } catch (error) {
    new Error(error);
    return URL;
  }
};

class Discover extends Component {
  constructor() {
    super();
    this.state = {
      init: 0,
      loading: false,
      podcasts: [],
      error: null,
      loadContent: false,
      term: ''
    };
    this.searchForPodcasts = searchForPodcasts.bind(this);
    this.getFinalURL = getFinalURL;
    this.searchHandler = this.searchHandler.bind(this);
    this.getPopularPodcasts = getPopularPodcasts.bind(this);
    this.updatePodcasts = this.updatePodcasts.bind(this);
    this.GridRender = this.GridRender.bind(this);
  }

  componentDidMount() {
    this.getPopularPodcasts();
  }

  updatePodcasts({podcasts, value}){

    if(podcasts.length < 1){
      this.setState({results: 'empty', podcasts:[]})
      return;
    }
    this.setState({podcasts, term:value, results: '' })
  }

  getClickHandler(domain) {
    const addPodcastHandler = this.props.addPodcastHandler;
    const actionAfterClick = this.props.actionAfterClick;
    const request = this.getFinalURL;
    return () => {
      this.setState({ loadContent: true });
      request(domain)
        .then((finalDomain) => {
          this.setState({ loadContent: false });
          addPodcastHandler(finalDomain, actionAfterClick);
        })
        .catch(console.error);
    };
  }

  searchHandler(a, b) {
    const { id } = b;
    const domain = `https://www.listennotes.com/c/r/${id}`;
    this.setState({ loadContent: true });
    const request = this.getFinalURL;
    const addPodcastHandler = this.props.addPodcastHandler;
    const actionAfterClick = this.props.actionAfterClick;
    request(domain)
      .then((finalDomain) => {
        addPodcastHandler(finalDomain, actionAfterClick);
        this.setState({ loadContent: false });
      })
      .catch(console.error);
  }

  GridRender({casts, classes}) {
    // xs={12} sm={6} md={4} lg={3}
    return <Grid container>
    {casts ?
      casts.map((podcast) => (
        <Grid key={podcast.title} item xs={12} sm={6} md={4} lg={3}>
          <List
            dense
            component="nav"
            aria-label="top podcast"
            key={podcast.title}
          >
            <ListItem
              button
              onClick={this.getClickHandler.call(this, podcast.rss)}
            >
              <img
                style={{ width: "8em", marginRight:".5em" }}
                alt={podcast.title}
                src={podcast.thumbnail}
              />

              <ListItemText
                primaryTypographyProps={{
                  noWrap: true,
                  elementtype: "span",
                  variant:'subtitle1'
                }}
                secondaryTypographyProps={{
                  noWrap: true,
                  elementtype: "span",
                }}
                primary={podcast.title}
                secondary={podcast.publisher}
              />
            </ListItem>
          </List>
        </Grid>
      )) : <Typography align='center' style={{paddingTop: '20%' }} letterSpacing={6} variant="h4"> <Loading /> </Typography>  }
  </Grid>
  }

  render() {
    const { podcasts, top, results } = this.state;
    const casts = podcasts.length > 0 ? podcasts : top ;
    const { classes } = this.props;
    const {GridRender } = this;
    return <>
          <Header classes={classes}  searchHandler={this.searchHandler} />
          <Card>
              {/* <Geners selected={this.state.init} getPopularPodcasts={this.getPopularPodcasts} /> */}
            <CardContent>
            <Search handleChange={this.searchForPodcasts} updatePodcasts={this.updatePodcasts} />
            <Typography variant={"h6"} >
                { results !== 'empty' &&  ( podcasts.length > 0  ? `Results` : "Trending" )}     
            </Typography>
            { results === 'empty' ? 
              <Typography variant={'h6'}>No results were found.</Typography>  : 
              <GridRender casts={casts} classes={classes} />
            }
            </CardContent>
          </Card>
          <Backdrop
            className={classes.backdrop}
            open={this.state.loadContent || false}>
            <CircularProgress color="inherit" />
          </Backdrop>
      </>;
  }
}

Discover.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Discover);
  