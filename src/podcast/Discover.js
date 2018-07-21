import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper';
import {driveThruDNS,getPodcastColor,convertURLToPodcast} from '../engine/podcast';
import {styles} from './PodcastGrid';
import CircularProgress from '@material-ui/core/CircularProgress';
import { getPopularPodcasts, searchForPodcasts } from '../engine/podcast';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

class Discover extends Component {
	constructor(props) {
		super();
		this.state = {
            init: true,
            loading: false,
            podcasts: [],
            error:null
        }
        this.searchForPodcasts = searchForPodcasts.bind(this);
        this.handleChange = this.handleChange.bind(this)
        // this.addPodcast = this.props.addPodcast;
	}
	componentDidMount() {
    // this.setState({loading:true});
		// getPopularPodcasts()
    //     .then( podcasts => this.setState({podcasts,loading:false}) )
    //     .catch( el => this.setState({'podcasts':[],'error':el}) );
	}

  getClickHandler(domain){
      let addPodcastHandler =  this.props.addPodcastHandler;
      let actionAfterClick = this.props.actionAfterClick;
      return function(){
          addPodcastHandler(convertURLToPodcast(domain),actionAfterClick);
      }
  }
  
  handleChange(ev){
    let search = ev.target.value;
    if(search.length > 2) {
      this.setState({loading:true});
      this.searchForPodcasts(search)
      .then( podcasts => this.setState({podcasts,loading:false,init:false}) )
      .catch( el => this.setState({'podcasts':[],'error':el}) );
    }
  }
  
	render() {
    let podcasts = this.state.podcasts;
    let classes = this.props.classes;

		return ( 
          <div>
            <Grid container spacing={24} alignItems="center">
              <Grid item xs={12 } >
                <TextField
                    id="podcast" 
                    style={{width:'90%',marginLeft:'20px'}} 
                    label="Type Podcast Name" 
                    onChange={this.handleChange}
                />
              </Grid>
            </Grid>
            { ( podcasts && podcasts.length > 0 ) ?
            <Grid style={{paddingTop:'2em'}} container spacing={0} direction={'row'}>
              { podcasts.map( (cast,ins) =>
                <Grid item xs={3} sm={2} md={1} key={ins} >
                  <Card classes={{root:this.props.classes.card}} style={getPodcastColor(cast)}>
                  <div className={classes.relativeContainer}>
                    <CardContent className={classes.cardContent}>
                      {cast.title}
                    </CardContent>
                    <CardMedia
                        onClick={this.getClickHandler.call(this,cast.feed_url)}
                        domain={cast.feed_url} title={cast.title} 
                        className={this.props.classes.podcastMedia} 
                        image={cast.image_url}
                      />
                  </div>
                  </Card>
                </Grid>
              )}
            </Grid>: this.state.loading ?
            <div className={classes.progressContainer}>
              <CircularProgress className={classes.progress} />
            </div> : <Grid container style={{padding:"2em"}}>
                      <Typography variant="display1">{this.state.init ? "Search for Podcasts":"Nothing Found"}</Typography> 
                     </Grid> }
        </div>);
	}
}

Discover.propTypes = {
    classes: PropTypes.object.isRequired,
  };

export default withStyles(styles)(Discover);
