import React, {useState, useEffect} from "react";
import makeStyles from '@mui/styles/makeStyles';
import Chip from "@mui/material/Chip";

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


export default ({getPopularPodcasts, selected}) => {
  const classes = useStyles();
  const [genres, setGenres] = useState([]);

  const getCategories = () => {
    import("./genres.json")
            .then((response) => {
                const {
                  genres
                } = response;
                return genres;
            })
            .then( data => setGenres([{id: 0, name: "Top", parent_id: null}, ...data]))
  }

  useEffect(()=> {
    getCategories()
  },[])
  return (
    <div className={classes.root}>
      {genres && genres.sort((a,b)=> {
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
      }).map((genre, id) => (
        <Chip key={id} 
              onClick={()=>getPopularPodcasts(genre.id)} 
              label={genre.name} 
              variant={ (selected === genre.id) ? 'default' : 'outlined'} 
              color={ genre.name === "Top" ? "secondary" : "primary" } />
      ))}
    </div>
  );
}
