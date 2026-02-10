import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

export const keys = [
  'NPR', 'BBC', 'Earwolf', 'Gimlet', 'Parcast', 'Wondery', 'Libsyn'
]

export default (props) => {
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

  return (<> 
    <Grid
      sx={{ paddingBottom: ".5rem" }}
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      <Grid xs={12} md={8}
        item >
        <FormControl variant="outlined" sx={{ width: "100%" }}>
          <InputLabel htmlFor="outlined-search">Search Podcasts</InputLabel>
          <OutlinedInput
            color={'primary'}
            id="outlined-search"
            variant="outlined"
            onKeyUp={onSetTerm}
            onKeyDown={onChange}
            label="Search Podcasts"
            endAdornment={
              <InputAdornment position="end">
                <IconButton type="submit" aria-label="search" onClick={()=>clickHandler()} >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </Grid>
    </Grid>
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        "& > *": {
          m: 0.5,
        },
      }}
    >
      {
        keys.map(key => <Chip   
          label={key} key={key} variant={'outlined'} onClick={() => action(key)} color={"primary"} />)
      }
    </Box>
    </>
  );
}
