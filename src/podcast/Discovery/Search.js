import React, { useState } from 'react';
import Grid from "@material-ui/core/Grid";
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';

import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import InputLabel from '@material-ui/core/InputLabel';


export default (props) => {
    const [term, setTerm] = useState('');
    const onClick = () => {
      if(term.length < 2) return;
      const { handleChange, updatePodcasts  } = props;
      handleChange(term).then(updatePodcasts);
    }

    const onChange = (ev) => {
      const {value} = ev.target;
      if (ev.key === 'Enter') {
        if(value.length < 2) return;
        const { handleChange, updatePodcasts  } = props;
        handleChange(value).then(updatePodcasts);
      }
      setTerm(value);
    }
  
    return ( <Grid
              container
              direction="row"
              justify="center"
              alignItems="center"
              >
        <Grid xs={12} md={8} 
              item >
          <FormControl variant="outlined" style={{width:'100%'}}>
            <InputLabel htmlFor="outlined-search">Search Podcasts</InputLabel>
            <OutlinedInput
              color={'primary'}
              id="outlined-search"
              variant="outlined"
              onKeyPress={onChange}
              labelWidth={125}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton type="submit" aria-label="search" onClick={onClick} >
                      <SearchIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </Grid>
      </Grid> );
  }