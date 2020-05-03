import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import React, {useContext} from "react";
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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import {AppContext} from '../App';


const styles = (theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
});



const Settings = (props) => {
  const {state, dispatch} = useContext(AppContext)

  const themeSwitcher = () =>{
    const value = state.theme;
    dispatch({type: 'setDark' , payload: !value });
  };
  
  const eraseThisPodcast =  (podcast) => () => {
      const podcasts = state.podcasts.filter((cast) => cast.domain !== podcast );
      dispatch({type:'updatePodcasts', podcasts: podcasts});
  };
  const {podcasts} = state;

  return (
    <>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6">Settings</Typography>
        </Toolbar>
      </AppBar>
      <Card variant="outlined">
      <CardContent>
        <Typography variant="h5">Configurations</Typography>
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
            <List style={{width:'100%'}}>
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
