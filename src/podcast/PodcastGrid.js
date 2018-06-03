import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';

const styles = theme => ({
  podcastMedia:{
    paddingTop: '100%',
    position:'relative',
    cursor: 'pointer'
  },
  podcastData:{
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color:'000',
    position:'absolute',
    bottom:0,
    width:'100%'
  }
});

function PodCastGrid(props) {
  const { classes } = props;

  return (
    <Grid container spacing={0} direction={'row'}>
      {props.casts && props.casts.map(cast =>
        <Grid item xs={4} sm={3} md={2} key={cast.domain} >
        <Card>
          <CardMedia onClick={props.selectPodcast} domain={cast.domain} title={cast.title} className={classes.podcastMedia} image={cast.image}>
          {/* <CardContent className={classes.podcastData}>
            {cast.title}
          </CardContent> */}
          </CardMedia>
          
        </Card>
        </Grid> 
       )}
    </Grid>
  );
}

PodCastGrid.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PodCastGrid);