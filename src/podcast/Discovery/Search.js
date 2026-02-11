import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import InputLabel from "@mui/material/InputLabel";

export default (props) => {
  const [term, setTerm] = useState("");
  const { handleChange, updatePodcasts } = props;

  const action = (value) =>
    value.length > 2 &&
    handleChange(value).then((podcasts) => updatePodcasts({ value, podcasts }));

  const clickHandler = () => {
    action(term);
  };

  const onSetTerm = (ev) => {
    const { value } = ev.target;
    setTerm(value);
  };

  const onKeyDown = (ev) => {
    const { value } = ev.target;
    if (ev.key === "Enter") {
      action(value);
    }
  };

  return (
    <Grid
      sx={{ pt: 1, pb: 2 }}
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      <Grid xs={12} item>
        <FormControl variant="outlined" sx={{ width: "100%" }}>
          <InputLabel htmlFor="outlined-search">Search Podcasts</InputLabel>
          <OutlinedInput
            color={"primary"}
            id="outlined-search"
            variant="outlined"
            value={term}
            onChange={onSetTerm}
            onKeyDown={onKeyDown}
            label="Search Podcasts"
            endAdornment={
              <InputAdornment position="end">
                <IconButton type="submit" aria-label="search" onClick={clickHandler}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </Grid>
    </Grid>
  );
};
