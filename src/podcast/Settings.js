import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import React, { useContext } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { withStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from "@material-ui/core/Typography";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import { FormControlLabel, Button } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
import PodcastEngine from "podcastsuite";
import { AppContext } from '../App';
import {version} from '../../package.json';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import BrightnessLowIcon from '@material-ui/icons/WbSunny';
import BrightnessHighIcon from '@material-ui/icons/NightsStay';

import { initializeLibrary } from '../engine/index'

const styles = (theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  appHeader: {
    WebkitAppRegion: 'drag',
  },
});



const Settings = (props) => {
  const { classes } = props;
  const { state, dispatch, engine } = useContext(AppContext)

  const themeSwitcher = (ev, input) => {
    dispatch({ type: 'setDark', payload: input });
  };

  const clearState = async () => {
    await dispatch({ type: 'resetState' });
    await initializeLibrary(engine, dispatch)
    // window.location.reload()
  }

  const reloadCasts = async () => {
    await initializeLibrary(engine, dispatch);
  }

  const eraseThisPodcast = (podcast) => async () => {
    const podcasts = state.podcasts.filter((cast) => cast.domain !== podcast);
    dispatch({ type: 'updatePodcasts', podcasts: podcasts });
    await PodcastEngine.db.del(podcast);
  };

  const flushData = () => {
    dispatch()
  }
  const { podcasts } = state;

  return (
    <>
      <AppBar className={classes.appHeader} position="static">
        <Toolbar variant="dense">
          <Typography variant="h6">Settings</Typography>
        </Toolbar>
      </AppBar>
      <Card>
        <CardContent>
        <Typography variant={'h5'}>Configurations</Typography>
        Version: {version}
        
      </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant={'h6'} gutterBottom >Theme Selector</Typography>
          <ToggleButtonGroup
            value={state.theme}
            exclusive
            onChange={themeSwitcher}
            aria-label="text alignment"
          >
            <ToggleButton value={'light'} aria-label="White">
              <BrightnessLowIcon />
            </ToggleButton>
            <ToggleButton value={'dark'} aria-label="Black">
              <BrightnessHighIcon />
            </ToggleButton>
            <ToggleButton value={'os'} aria-label="right aligned">
              OS
            </ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>
      <Card >
        
          <ExpansionPanel >
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
               <Typography variant="h6" gutterBottom > Data </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <List style={{ width: '100%' }}>
                <Divider />
                {podcasts &&
                  podcasts.map((podcast) => (
                    <div key={podcast.domain}>
                      <ListItem>
                        <ListItemText
                          secondary={
                            <Typography component="span" variant="subtitle1">
                              {podcast.title} <br />
                              <Typography component="span" variant="caption">
                                {new Date(podcast.created).toLocaleString()}
                              </Typography>
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            aria-label="Delete"
                            onClick={eraseThisPodcast(
                              podcast.domain
                            )}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </div>
                  ))}
              </List>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        
      </Card>
      <Card variant="outlined">
        {/* <CardHeader title="Data" /> */}
        <CardContent>
          <Button variant="outlined" color="primary" onClick={clearState} > Reset State </Button>
          <Button variant="outlined" color="primary" onClick={reloadCasts} >Reload Saved Podcasts </Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent align="center">
          <Typography variant="h5">Phonograph</Typography>
          <Typography>is developed with ❤️ in Hoboken, NJ</Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default withStyles(styles)(Settings);
