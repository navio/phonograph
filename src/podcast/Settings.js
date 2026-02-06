import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import React, { useContext } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { Button } from "@mui/material";
import PodcastEngine from "podcastsuite";
import { AppContext } from '../App';
import {version} from '../../package.json';

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import BrightnessLowIcon from "@mui/icons-material/WbSunny";
import BrightnessHighIcon from "@mui/icons-material/NightsStay";

import { initializeLibrary } from '../engine/index'

const Settings = (props) => {
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
      <AppBar sx={{ WebkitAppRegion: "drag" }} position="static">
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
        
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
               <Typography variant="h6" gutterBottom > Data </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List style={{ width: '100%' }}>
                <Divider />
                {podcasts &&
                  podcasts.map((podcast) => (
                    <div key={podcast.domain}>
                      <ListItem
                        secondaryAction={
                          <IconButton
                            aria-label="Delete"
                            onClick={eraseThisPodcast(podcast.domain)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
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
                      </ListItem>
                      <Divider />
                    </div>
                  ))}
              </List>
            </AccordionDetails>
          </Accordion>
        
      </Card>
      <Card variant="outlined">
        {/* <CardHeader title="Data" /> */}
        <CardContent>
          <Button variant="outlined" color="primary" onClick={clearState} > Reset State </Button>
          <Button variant="outlined" color="primary" onClick={reloadCasts} >Reload Saved Podcasts </Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h5">Phonograph</Typography>
          <Typography>is developed with ❤️ in Hoboken, NJ</Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default Settings;
