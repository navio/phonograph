import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Add from '@material-ui/icons/Add';
import {driveThruDNS} from '../engine/podcast';
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
  },
  addIcon:{
    width:'3em',
    height:'3em'
  },
  card:{
    height:'100%',
    width:'100%'
  }
});
const addMore = 'addmore';

function PodCastGrid(props) {
  const { classes } = props;
  let casts = (props.casts && [...props.casts]) || [];
  casts.push({domain: addMore, title:'Add more', onClick:()=>{ let cast = prompt('URL or Name of Podcast')}});
  return (
    <Grid container spacing={0} direction={'row'}>
      { casts && casts.map(cast =>
        <Grid item xs={3} sm={2} md={1} key={cast.domain} >
          <Card classes={{root:classes.card}}>
            { cast.domain === addMore
            ? <IconButton onClick={cast.onClick} classes={{root:classes.card}}>
                <Add classes={{root:classes.addIcon}} />
              </IconButton>
            : <CardMedia 
                onClick={props.selectPodcast} 
                domain={cast.domain} title={cast.title} 
                className={classes.podcastMedia} 
                image={driveThruDNS(cast.image)}
              >
            </CardMedia>}
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