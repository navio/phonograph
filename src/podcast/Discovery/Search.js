import React, { useState } from 'react';
import Grid from "@mui/material/Grid";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';

import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import InputLabel from '@mui/material/InputLabel';

import Chip from "@mui/material/Chip";

import makeStyles from '@mui/styles/makeStyles';

export const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(0.5),
    },
  },
}));

export const keys = [
  'NPR', 'BBC', 'Earwolf', 'Gimlet', 'Parcast', 'Wondery', 'Libsyn'
]

export default (props) => {
  const classes = useStyles();
  
  const [term, setTerm] = useState('');
  const { handleChange, updatePodcasts } = props;

  const action = (value) => 
  (value.length > 2) && handleChange(value).then((podcasts)=>updatePodcasts({value, podcasts}));
  
  const clickHandler = () => { 
    action(term);
  }

  const onSetTerm = (ev) => {
    const { value } = ev.target;
    setTerm(value);
  }

  const onChange = (ev) => {
    const { value } = ev.target;
    if (ev.key === 'Enter') {
      action(value)
    }
  }

  return <> 
    <Grid
      style={{ paddingBottom: '.5rem' }}
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      <Grid xs={12} md={8}
        item >
        <FormControl variant="outlined" style={{ width: '100%' }}>
          <InputLabel htmlFor="outlined-search">Search Podcasts</InputLabel>
          <OutlinedInput
            color={'primary'}
            id="outlined-search"
            variant="outlined"
            onKeyUp={onSetTerm}
            onKeyPress={onChange}
            labelWidth={125}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  aria-label="search"
                  onClick={()=>clickHandler()}
                  size="large">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </Grid>
    </Grid>
    <div className={classes.root}>
      {
        keys.map(key => <Chip   
          label={key} key={key} variant={'outlined'} onClick={() => action(key)} color={"primary"} />)
      }
    </div>
    </>;
}