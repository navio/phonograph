import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles, fade } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import {
  getPopularPodcasts,
  searchForPodcasts,
  getPodcastColor,
} from "../engine/podcast";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Backdrop from "@material-ui/core/Backdrop";

// --
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";

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

class Discover extends Component {
  constructor(props) {
    super();
    this.state = {
      init: true,
      loading: false,
      podcasts: [],
      error: null,
      term: null,
      loadContent: false,
    };
    this.searchForPodcasts = searchForPodcasts.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getFinalURL = this.getFinalURL.bind(this);
    // this.addPodcast = this.props.addPodcast;
  }
  componentDidMount() {
    getPopularPodcasts.call(this);
  }

  async getFinalURL(url) {
    const URL = `/api/findFinal/?term=${url}`;
    try {
      const data = await fetch(URL);
      const result = await data.json();
      return result.url;
    } catch (error) {
      new Error(error);
      return URL;
    }
  }

  getClickHandler(domain) {
    let addPodcastHandler = this.props.addPodcastHandler;
    let actionAfterClick = this.props.actionAfterClick;
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

  handleChange(ev) {
    let search = ev.target.value;
    if (search) {
      this.setState({ loading: true });
      this.searchForPodcasts(search)
        .then((podcasts) => {
          const cleanedCasts = podcasts.map((podcast) => {
            const {
              title_original: title,
              website: domain,
              thumbnail,
              id,
              publisher_original: publisher,
            } = podcast;
            const rss = `https://www.listennotes.com/c/r/${id}`;
            return {
              title,
              thumbnail,
              domain,
              rss,
              publisher,
            };
          });
          this.setState({
            podcasts: cleanedCasts.slice(0, 4),
            loading: false,
            init: false,
            term: search,
          });
        })
        .catch((el) => this.setState({ podcasts: [], error: el, term: null }));
    } else {
      this.setState({ podcasts: [], init: true, term: null });
      //getPopularPodcasts.call(this);
    }
  }

  render() {
    const podcasts = this.state.podcasts;
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
          <AppBar position="static">
            <Grid>
              <Toolbar variant="dense">
                <Grid item xs={8}>
                  <Typography variant="h6">Discover</Typography>
                </Grid>
                <Grid item md={4} xs={12}>
                  <div className={classes.search}>
                    <div className={classes.searchIcon}>
                      <SearchIcon />
                    </div>
                    <InputBase
                      placeholder="Search…"
                      classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput,
                      }}
                      inputProps={{ "aria-label": "search" }}
                      onChange={this.handleChange}
                    />
                  </div>
                </Grid>
              </Toolbar>
            </Grid>
          </AppBar>
          {podcasts && podcasts.length > 0 ? (
            <>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2">
                    {!this.state.term
                      ? "Trending"
                      : `Results for "${this.state.term}"`}
                  </Typography>
                </CardContent>
              </Card>
              <Grid
                // style={{ paddingTop: "2em" }}
                container
                spacing={0}
                direction={"row"}
              >
                {podcasts.map((cast, ins) => {
                  return (
                    <Grid item xs={6} sm={3} key={ins}>
                      <Card
                        className={classes.cardPointerValue}
                        onClick={this.getClickHandler.call(this, cast.rss)}
                        domain={cast.rss}
                      >
                        <CardMedia
                          className={classes.cover}
                          image={cast.thumbnail}
                          title={cast.title}
                        />
                        <CardContent>
                          <Typography component="p" variant="h6" noWrap>
                            {cast.title}
                          </Typography>
                          {cast.publisher && (
                            <Typography
                              component="p"
                              variant="subtitle2"
                              noWrap
                            >
                              By {cast.publisher}
                            </Typography>
                          )}
                          {cast.episodes && (
                            <Typography component="p" variant="overline">
                              Episodes: {cast.episodes}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          ) : this.state.loading ? (
            <div className={classes.progressContainer}>
              <CircularProgress className={classes.progress} />
            </div>
          ) : (
            this.state.term && (
              <Card>
                <CardContent>
                  <Grid container>
                    <Typography variant={"h5"}>
                      {this.state.term &&
                        `Nothing Found for "${this.state.term}"`}
                    </Typography>
                  </Grid>
                </CardContent>
              </Card>
            )
          )}
          <Card>
            <CardContent>
              <Typography variant={"h5"} component={"h2"}>
                Today Top Podcasts
              </Typography>
            </CardContent>
            <CardContent>
              <Grid container>
                {topPodcasts &&
                  topPodcasts.map((podcast) => (
                    <Grid item xs={6} sm={4} md={3}>
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
                          <ListItemAvatar>
                            <Avatar
                              alt={podcast.title}
                              src={podcast.thumbnail}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            classes={{
                              root: classes.listItem,
                            }}
                            primaryTypographyProps={{
                              noWrap: true,
                              elementtype: "span",
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
