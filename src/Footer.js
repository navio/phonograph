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
    }
};

class SimpleBottomNavigation extends React.Component {

  render() {
    const { classes } = this.props;
    // const { value } = this.state;

    return (
    <Paper className={classes.root} elevation={4}>
      <BottomNavigation
        // value={value}
        onChange={this.handleChange}
        showLabels
        className={classes.root}
      >
        <BottomNavigationAction label="Podcasts" icon={<RestoreIcon />} />
        <BottomNavigationAction label="Discover" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Settings" icon={<LocationOnIcon />} />
      </BottomNavigation>
    </Paper>
    );
  }
}

SimpleBottomNavigation.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleBottomNavigation);
