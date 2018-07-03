import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import {driveThruDNS,convertURLToPodcast} from '../engine/podcast';
import {viewCurrenPodcast} from '../engine/routes';
import {styles} from './PodcastGrid';
import { getPopularPodcasts } from '../engine/podcast';

class Discover extends Component {
	constructor(props) {
        
		super();
		this.state = {
            podcasts: [],
            error:null
        }
        // this.addPodcast = this.props.addPodcast;
	}
	componentDidMount() {
		getPopularPodcasts()
        .then( podcasts => this.setState({podcasts}) )
        .catch( el => this.setState({'podcasts':[],'error':el}) );
	}

    getClickHandler(domain){
        let addPodcastHandler =  this.props.addPodcastHandler;
        let actionAfterClick = this.props.actionAfterClick;
        return function(){
            addPodcastHandler(convertURLToPodcast(domain),actionAfterClick);
        }
    }

	render() {
		return (
            <Grid container spacing={0} direction={'row'}>
            { this.state.podcasts.map(cast =>
              <Grid item xs={3} sm={2} md={1} key={cast.domain} >
                <Card classes={{root:this.props.classes.card}}>
                   <CardMedia
                      onClick={this.getClickHandler.call(this,cast.feed_url)}
                      domain={cast.feed_url} title={cast.title} 
                      className={this.props.classes.podcastMedia} 
                      image={cast.image_url}
                    >
                  </CardMedia>
                </Card>
              </Grid> 
             )}
          </Grid>
        );
	}
}

Discover.propTypes = {
    classes: PropTypes.object.isRequired,
  };

export default withStyles(styles)(Discover);
