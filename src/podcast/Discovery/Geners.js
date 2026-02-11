import React, { useState, useEffect, useMemo } from "react";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

const TOP = { id: 0, name: "Top", parent_id: null };

export default ({ getPopularPodcasts, selected }) => {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    import("./genres.json")
      .then((response) => response.default || response)
      .then((data) => {
        const { genres = [] } = data || {};
        setGenres(genres);
      });
  }, []);

  const sortedGenres = useMemo(() => {
    const rest = [...(genres || [])].sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
    // Always keep Top first.
    return [TOP, ...rest.filter((g) => g && g.id !== 0)];
  }, [genres]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        width: "100%",
        "& > *": {
          m: 0.5,
        },
      }}
    >
      {sortedGenres.map((genre) => (
        <Chip
          key={genre.id}
          onClick={() => getPopularPodcasts(genre.id)}
          label={genre.name}
          variant={selected === genre.id ? "filled" : "outlined"}
          color={genre.id === 0 ? "secondary" : "primary"}
        />
      ))}
    </Box>
  );
};
