import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import InputLabel from "@mui/material/InputLabel";
import { useIntl } from "react-intl";

interface SearchProps<T> {
  handleChange: (value: string) => Promise<T[]>;
  updatePodcasts: (args: { value: string; podcasts: T[] }) => void;
}

const Search = <T,>({ handleChange, updatePodcasts }: SearchProps<T>): React.ReactElement => {
  const intl = useIntl();
  const [term, setTerm] = useState("");

  const searchLabel = intl.formatMessage({ id: "discover.searchPodcasts", defaultMessage: "Search Podcasts" });

  const action = (value: string) =>
    value.length > 2 &&
    handleChange(value).then((podcasts) => updatePodcasts({ value, podcasts }));

  const clickHandler = () => {
    action(term);
  };

  const onSetTerm = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = ev.target;
    setTerm(value);
  };

  const onKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    const { value } = ev.currentTarget;
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
          <InputLabel htmlFor="outlined-search">{searchLabel}</InputLabel>
          <OutlinedInput
            color={"primary"}
            id="outlined-search"
            value={term}
            onChange={onSetTerm}
            onKeyDown={onKeyDown}
            label={searchLabel}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  aria-label={intl.formatMessage({ id: "a11y.search", defaultMessage: "search" })}
                  onClick={clickHandler}
                >
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

export default Search;
