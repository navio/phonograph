import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import RestoreIcon from '@material-ui/icons/Restore';
import FavoriteIcon from '@material-ui/icons/Favorite';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Paper from '@material-ui/core/Paper';

const styles = {
    root:{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        borderTop: '1px solid rgba(0, 0, 0, 0.12)'
    },
    underground:{
      height:48,
      width:'100%'
    }
};

class SimpleBottomNavigation extends React.Component {

  render() {
    const { classes } = this.props;
    // const { value } = this.state;

    return (
    <div><Paper className={classes.root} elevation={4}>
      <BottomNavigation
        // value={value}
        onChange={this.handleChange}
        showLabels
        className={classes.root}
      >
        <BottomNavigationAction label="Podcasts" onClick={this.props.toPodcasts} icon={<RestoreIcon />} />
        <BottomNavigationAction label="Discover" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Settings" icon={<LocationOnIcon />} />
      </BottomNavigation>
    </Paper><div className={classes.underground}></div></div>
    );
  }
}

SimpleBottomNavigation.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleBottomNavigation);
