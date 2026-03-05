import React, { useState, useEffect, useMemo } from "react";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

interface Genre {
  id: number;
  name: string;
  parent_id?: number | null;
}

const TOP: Genre = { id: 0, name: "Top", parent_id: null };

interface GenersProps {
  getPopularPodcasts: (genreId: number) => void;
  selected?: number;
}

const Geners: React.FC<GenersProps> = ({ getPopularPodcasts, selected }) => {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    import("./genres.json")
      .then((response) => (response as any).default || response)
      .then((data: { genres?: Genre[] }) => {
        const { genres = [] } = data || {};
        setGenres(genres);
      });
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
          onClick={() => getPopularPodcasts(genre.id)}
          label={genre.name}
          variant={selected === genre.id ? "filled" : "outlined"}
          color={genre.id === 0 ? "secondary" : "primary"}
        />
      ))}
    </Box>
  );
};

export default Geners;
