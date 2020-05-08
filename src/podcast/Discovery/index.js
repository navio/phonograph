import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles, fade } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Backdrop from "@material-ui/core/Backdrop";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Geners from './Geners';

import { getPopularPodcasts, searchForPodcasts } from './engine';

import Search from "./Search";

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
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
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
  listItem: {
    display: "inline-grid",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
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

const Header = ({ searchHandler }) => (
  <AppBar position="static">
    <Grid>
      <Toolbar variant="dense">
        <Grid item xs={8}>
          <Typography variant="h6">Discover</Typography>
        </Grid>
        <Grid item md={4} xs={12}>
          <Search onChange={searchHandler} />
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
    };
    this.searchForPodcasts = searchForPodcasts.bind(this);
    this.getFinalURL = getFinalURL.bind(this);
    this.searchHandler = this.searchHandler.bind(this);
    this.getPopularPodcasts = getPopularPodcasts.bind(this);
  }

  componentDidMount() {
    this.getPopularPodcasts();
  }

  getClickHandler(domain) {
    const addPodcastHandler = this.props.addPodcastHandler;
    const actionAfterClick = this.props.actionAfterClick;
    const request = this.getFinalURL;
    return () => {
      this.setState({ loadContent: true });
      request(domain)
        .then((finalDomain) => {
          addPodcastHandler(finalDomain, actionAfterClick);
          this.setState({ loadContent: false });
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

  render() {
    const topPodcasts = this.state.top;
    const { classes } = this.props;
    return (
      <>
        <Backdrop
          className={classes.backdrop}
          open={this.state.loadContent || false}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Card>
          <Header searchHandler={this.searchHandler} />
          <Card>
            <CardContent>
              <Typography variant={"h5"} pb={0} component={"h2"}>
                Trending Today
              </Typography>
            </CardContent>
            <CardContent>
              <Geners selected={this.state.init} getPopularPodcasts={this.getPopularPodcasts} />
            </CardContent>
            <CardContent>
            <Typography variant={"h6"} >{this.state.name}</Typography>
              <Grid container>
                {topPodcasts &&
                  topPodcasts.map((podcast) => (
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
                            classes={{
                              root: classes.listItem,
                            }}
                            primaryTypographyProps={{
                              noWrap: true,
                              elementtype: "span",
                              variant:'subtitle1'
                            }}
                            primary={podcast.title}
                            secondaryTypographyProps={{
                              noWrap: true,
                              elementtype: "span",
                            }}
                            secondary={podcast.publisher}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  ))}
              </Grid>
            </CardContent>
          </Card>
        </Card>
      </>
    );
  }
}

Discover.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Discover);
  