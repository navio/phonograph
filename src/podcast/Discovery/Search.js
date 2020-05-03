import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import SearchEngine from "../../engine/PodcastSearcher";
import { fade, withStyles } from "@material-ui/core/styles";

const engine = new SearchEngine("/ln/");

const StyledField = withStyles((theme) => ({
  root: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    outline: theme.palette.common.white, 
    backgroundColor: fade(theme.palette.common.white, 0.35),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
  }
}))(TextField);

export default ({ onChange }) => {
  const [options, setOptions] = React.useState([]);
  const [term, setTerm] = React.useState("");
  const def = () => null;

  React.useEffect(() => {
    engine.listennotes(term).then((data) => {
      const { podcasts } = data;
      setOptions(podcasts);
    });
  }, [term]);
  return (
    <Autocomplete
      filterOptions={(x) => x}
      options={options}
      popupIcon={<></>}
      onChange={onChange}
      getOptionLabel={(option) => option.title_original}
      renderOption={(option, key) => (
        <div width={"100%"} value={option.id} key={key}>
           <img
                            style={{ width: "2em", paddingRight:".2em" }}
                            alt={option.title_original}
                            src={option.thumbnail}
                          />
          {option.title_original}
        </div>
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
