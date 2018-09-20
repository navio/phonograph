import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Paper from "@material-ui/core/Paper";
import {
  driveThruDNS, 
  getPopularPodcasts, 
  searchForPodcasts,
  getPodcastColor,
  convertURLToPodcast
} from "../engine/podcast";
import { styles } from "./PodcastGrid";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import InputAdornment from '@material-ui/core/InputAdornment';


class Discover extends Component {
  constructor(props) {
    super();
    this.state = {
      init: true,
      loading: false,
      podcasts: [],
      error: null
    };
    this.searchForPodcasts = searchForPodcasts.bind(this);
    this.handleChange = this.handleChange.bind(this);
    // this.addPodcast = this.props.addPodcast;
  }
  componentDidMount() {
    // this.setState({loading:true});
    // getPopularPodcasts()
    //     .then( podcasts => this.setState({podcasts,loading:false}) )
    //     .catch( el => this.setState({'podcasts':[],'error':el}) );
  }

  getClickHandler(domain) {
    let addPodcastHandler = this.props.addPodcastHandler;
    let actionAfterClick = this.props.actionAfterClick;
    return function() {
      addPodcastHandler(convertURLToPodcast(domain), actionAfterClick)
    };
  }

  handleChange(ev) {
    let search = ev.target.value;
    if (search) {
      this.setState({ loading: true });
      this.searchForPodcasts(search)
        .then(podcasts =>
          this.setState({ podcasts, loading: false, init: false })
        )
        .catch(el => this.setState({ podcasts: [], error: el }));
    } else {
      this.setState({ podcasts: [], init: true });
    }
  }

  render() {
    let podcasts = this.state.podcasts;
    let {classes} = this.props;
    return (
      <Card >
        <CardContent>
          <Typography variant="headline" component="h2">
            Search
          </Typography>
          <TextField
            id="podcast"
            style={{ width: "100%", paddingTop: "5px" }}
            label="Type Podcast Name"
            onChange={this.handleChange}
          />
        </CardContent>
        { podcasts && podcasts.length > 0 ? (
          <Grid
            style={{ paddingTop: "2em" }}
            container
            spacing={0}
            direction={"row"}
          >
            {podcasts.map((cast, ins) => (
              <Grid item xs={3} sm={2} md={1} key={ins}>
                <Card
                  classes={{ root: this.props.classes.card }}
                  style={getPodcastColor(cast)}
                >
                  <div className={classes.relativeContainer}>
                    <CardContent className={classes.cardContent}>
                      {cast.title}
                    </CardContent>
                    <CardMedia
                      onClick={this.getClickHandler.call(this, cast.feed_url)}
                      domain={cast.feed_url}
                      title={cast.title}
                      className={this.props.classes.podcastMedia}
                      image={cast.image_url}
                    />
                  </div>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : this.state.loading ? 
          <div className={classes.progressContainer}>
            <CircularProgress className={classes.progress} />
          </div>
         : 
          <Grid container style={{ padding: "2em" }}>
            <Typography variant="title">
              {this.state.init ? "" : "Nothing Found"}
            </Typography>
          </Grid>
        }
      </Card>
    );
  }
}

Discover.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Discover);
