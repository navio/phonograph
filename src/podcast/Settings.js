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
import {FormControlLabel, Button } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
import PodcastEngine from "podcastsuite";
import { AppContext } from '../App';
import { CardHeader } from "@material-ui/core";


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
  const { state, dispatch } = useContext(AppContext)

  const themeSwitcher = () => {
    const value = state.theme;
    dispatch({ type: 'setDark', payload: !value });
  };

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
      <Card variant="outlined">
      <CardHeader title="Configurations" />
        <CardContent>
          <FormControlLabel control={<Switch color="primary" onChange={themeSwitcher} />} label="Toggle Theme" />
        </CardContent>
      </Card>
      <ExpansionPanel defaultExpanded>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5"> Podcasts Data</Typography>
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
      {/* <Card variant="outlined">
        <CardHeader title="Data" />
        <CardContent>
          <Button variant="outlined" > Flush Data </Button>
        </CardContent>
      </Card> */}
      <Card variant="outlined">
        <CardContent align="center">
          <Typography variant="h5">Phonograph</Typography>
          <Typography>is developed with ❤️ in Hoboken, NJ</Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default withStyles(styles)(Settings);
