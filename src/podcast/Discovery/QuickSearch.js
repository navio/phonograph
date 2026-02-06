import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import SearchEngine from "./PodcastSearcher";
import { alpha, styled } from "@mui/material/styles";

const engine = new SearchEngine("/ln/");

const StyledField = styled(TextField)(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  outline: theme.palette.common.white,
  backgroundColor: alpha(theme.palette.common.white, 0.35),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
}));

export default ({ onChange }) => {
  const [options, setOptions] = React.useState([""]);
  const [term, setTerm] = React.useState("");
  const def = () => null;

  React.useEffect(() => {
    if (term.length > 3) {
      engine.listennotes(term).then((data) => {
        const { podcasts } = data;
        setOptions(podcasts);
      });
    }
  }, [term]);
  return (
    <Autocomplete
      filterOptions={(x) => x}
      options={options}
      popupIcon={<></>}
      onChange={onChange}
      getOptionLabel={(option) => option.title_original}
      renderOption={(props, option) => (
        <li {...props} key={option.id} value={option.id}>
          <img
            style={{ width: "2em", paddingRight: ".2em" }}
            alt={option.title_original}
            src={option.thumbnail}
          />
          {option.title_original}
        </li>
      )}
      renderInput={(params) => {
        return (
          <StyledField
            {...params}
            placeholder="Podcast Search"
            onChange={(ev) => setTerm(ev.target.value)}
            margin="dense"
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        );
      }}
    />
  );
};
