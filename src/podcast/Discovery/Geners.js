import React, {useState, useEffect} from "react";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";


export default ({getPopularPodcasts, selected}) => {
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
      {genres && genres.sort((a,b)=> {
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
      }).map((genre, id) => (
        <Chip key={id} 
              onClick={()=>getPopularPodcasts(genre.id)} 
              label={genre.name} 
              variant={ (selected === genre.id) ? 'filled' : 'outlined'} 
              color={ genre.name === "Top" ? "secondary" : "primary" } />
      ))}
    </Box>
  );
}
