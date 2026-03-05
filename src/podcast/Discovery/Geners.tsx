import React, { useState, useEffect, useMemo } from "react";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { getApplePodcastGenres, PodcastGenre } from "./engine";

const TOP: PodcastGenre = { id: 0, name: "Top", parent_id: null };

interface GenersProps {
  onSelectGenre: (genre: PodcastGenre) => void;
  selected?: number;
}

const Geners: React.FC<GenersProps> = ({ onSelectGenre, selected }) => {
  const [genres, setGenres] = useState<PodcastGenre[]>([]);

  useEffect(() => {
    getApplePodcastGenres().then(setGenres).catch(() => setGenres([]));
  }, []);

  const sortedGenres = useMemo(() => {
    const rest = [...(genres || [])].sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
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
          onClick={() => onSelectGenre(genre)}
          label={genre.name}
          variant={selected === genre.id ? "filled" : "outlined"}
          color={genre.id === 0 ? "secondary" : "primary"}
        />
      ))}
    </Box>
  );
};

export default Geners;
